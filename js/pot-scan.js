// screenshot -> stat scanner for the Pot calculator, runs OCR locally via Tesseract.js

const POT_SCAN_CLASS_MAP = [
  { pattern:/\bguardian\b/i,  stat:"health" },
  { pattern:/\bwarrior\b/i,   stat:"physical" },
  { pattern:/\bberserker\b/i, stat:"physical" },
  { pattern:/\bknight\b/i,    stat:"physical" },
  { pattern:/\bpaladin\b/i,   stat:"physical" },
  { pattern:/\bmage\b/i,      stat:"spell" },
  { pattern:/\bwizard\b/i,    stat:"spell" },
  { pattern:/\bsorcerer\b/i,  stat:"spell" }
];

const POT_SCAN_STAT_LABEL = { physical:"Physical power", spell:"Spell Power", health:"Health" };

let potScanWorkerPromise = null;
function potScanGetWorker(){
  if(!potScanWorkerPromise) potScanWorkerPromise = Tesseract.createWorker("eng");
  return potScanWorkerPromise;
}

function potScanDigits(s){
  if(s == null) return NaN;
  const n = parseInt(String(s).replace(/[^\d]/g,""), 10);
  return isNaN(n) ? NaN : n;
}

function potScanParse(text){
  const clean = String(text || "").replace(/\r/g,"");
  const grab = re => { const m = clean.match(re); return m ? m[1] : null; };

  let physical = potScanDigits(grab(/phys(?:ical)?\s*(?:power)?[^\d]{0,26}([\d,]+)/i));
  let spell    = potScanDigits(grab(/spell\s*(?:power)?[^\d]{0,26}([\d,]+)/i));
  const health  = potScanDigits(grab(/health[^\d]{0,20}([\d,]+)/i));

  const upMatch = clean.match(/upgrades?[^\d]{0,16}([\d,]+)\s*\/\s*([\d,]+)/i);
  const upDone  = upMatch ? potScanDigits(upMatch[1]) : NaN;
  const upTotal = upMatch ? potScanDigits(upMatch[2]) : NaN;

  // label got mangled? grab leftover "power"-ish fragments in order instead
  if(isNaN(physical) || isNaN(spell)){
    const claimed = new Set([health, physical, spell].filter(v => !isNaN(v)));
    const powerRe = /(?:p?ower|powe)[a-z]*[^\d]{0,26}([\d,]+)/gi;
    const candidates = [];
    let m;
    while((m = powerRe.exec(clean))){
      const v = potScanDigits(m[1]);
      if(!claimed.has(v)) candidates.push(v);
    }
    let ci = 0;
    if(isNaN(physical) && candidates[ci] != null) physical = candidates[ci++];
    if(isNaN(spell) && candidates[ci] != null) spell = candidates[ci];
  }

  let classGuess = null;
  for(const c of POT_SCAN_CLASS_MAP){ if(c.pattern.test(clean)){ classGuess = c.stat; break; } }
  let guess = classGuess;
  if(!guess){
    const p = isNaN(physical) ? 0 : physical, s = isNaN(spell) ? 0 : spell;
    guess = (p || s) ? (p >= s * 3 ? "physical" : (s >= p * 3 ? "spell" : (p >= s ? "physical" : "spell"))) : "health";
  }

  const found = [physical, spell, health, upDone, upTotal].filter(v => !isNaN(v)).length;
  return { physical, spell, health, upDone, upTotal, guess, classGuess, found };
}

// merges two OCR passes, ties broken by whichever pass had higher confidence
function potScanMerge(a, b, confA, confB){
  confA = typeof confA === "number" ? confA : 0;
  confB = typeof confB === "number" ? confB : 0;
  const aWinsTies = confA >= confB;
  const pick = (x, y) => {
    if(isNaN(x)) return y;
    if(isNaN(y)) return x;
    if(x === y) return x;
    return aWinsTies ? x : y;
  };
  const physical = pick(a.physical, b.physical);
  const spell = pick(a.spell, b.spell);
  const health = pick(a.health, b.health);
  const upDone = pick(a.upDone, b.upDone);
  const upTotal = pick(a.upTotal, b.upTotal);

  let guess = a.classGuess || b.classGuess;
  if(!guess){
    const p = isNaN(physical) ? 0 : physical, s = isNaN(spell) ? 0 : spell;
    guess = (p || s) ? (p >= s * 3 ? "physical" : (s >= p * 3 ? "spell" : (p >= s ? "physical" : "spell"))) : "health";
  }

  return { physical, spell, health, upDone, upTotal, guess };
}

function potScanCanvas(img, grey){
  const scale = Math.max(2, Math.min(4, 1400 / Math.max(img.naturalWidth, 1)));
  const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  if(grey){
    const data = ctx.getImageData(0, 0, w, h);
    const px = data.data;
    for(let i = 0; i < px.length; i += 4){
      const l = 0.299 * px[i] + 0.587 * px[i+1] + 0.114 * px[i+2];
      const c = Math.min(255, Math.max(0, (l - 128) * 1.5 + 128));
      px[i] = px[i+1] = px[i+2] = c;
    }
    ctx.putImageData(data, 0, 0);
  }
  return canvas;
}

function potScanLoadImage(src){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't load that image."));
    img.src = src;
  });
}

function potScanFileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

(function initPotScan(){
  const box = $("scanBox");
  if(!box) return;

  const fileInput = $("scanFile");
  const idle = $("scanIdle");
  const busy = $("scanBusy");
  const busyText = $("scanBusyText");
  const previewWrap = $("scanPreviewWrap");
  const previewImg = $("scanPreviewImg");
  const removeBtn = $("scanRemove");
  const errorBox = $("scanError");
  const resultBox = $("scanResult");
  const statPicker = $("scanStatPicker");
  const upDoneEl = $("scanUpDone");
  const upTotalEl = $("scanUpTotal");
  const applyBtn = $("scanApply");
  const applyError = $("scanApplyError");

  let chosenStat = "health";
  let statInputs = {};

  function setBusy(on, text){
    busy.hidden = !on;
    if(on){
      idle.hidden = true;
      previewWrap.hidden = true;
      busyText.textContent = text || "Reading the screenshot…";
    }
  }

  function showError(msg){
    errorBox.hidden = false;
    errorBox.textContent = msg;
    resultBox.hidden = true;
  }
  function clearError(){ errorBox.hidden = true; errorBox.textContent = ""; }

  function resetBox(){
    fileInput.value = "";
    previewWrap.hidden = true;
    previewImg.src = "";
    busy.hidden = true;
    idle.hidden = false;
    clearError();
    resultBox.hidden = true;
    applyError.hidden = true;
    statInputs = {};
  }

  // every stat stays editable even when OCR missed it
  function buildStatPicker(parsed){
    statPicker.innerHTML = "";
    statInputs = {};
    chosenStat = parsed.guess;
    ["physical","spell","health"].forEach(stat => {
      const val = parsed[stat];
      const row = document.createElement("div");
      row.className = "scan-stat-row";

      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "scan-stat-select"; btn.dataset.stat = stat;
      btn.setAttribute("aria-pressed", String(stat === chosenStat));
      btn.textContent = POT_SCAN_STAT_LABEL[stat];
      btn.addEventListener("click", () => {
        chosenStat = stat;
        applyError.hidden = true;
        [...statPicker.children].forEach(r => r.querySelector(".scan-stat-select").setAttribute("aria-pressed", String(r === row)));
      });

      const input = document.createElement("input");
      input.type = "number"; input.min = "0"; input.step = "1";
      input.className = "scan-stat-input"; input.placeholder = "not found";
      if(!isNaN(val)) input.value = Math.round(val);
      input.addEventListener("input", () => { applyError.hidden = true; });
      statInputs[stat] = input;

      row.appendChild(btn);
      row.appendChild(input);
      statPicker.appendChild(row);
    });
  }

  function showResult(parsed){
    applyError.hidden = true;
    buildStatPicker(parsed);
    upDoneEl.value = isNaN(parsed.upDone) ? "" : Math.round(parsed.upDone);
    upTotalEl.value = isNaN(parsed.upTotal) ? "" : Math.round(parsed.upTotal);
    resultBox.hidden = false;

    if(isNaN(parsed.physical) && isNaN(parsed.spell) && isNaN(parsed.health) && isNaN(parsed.upDone) && isNaN(parsed.upTotal)){
      showError("Couldn't make out any stats in that screenshot. Try a clearer, uncropped screenshot of the item's stat card, or just enter the numbers below manually.");
      resultBox.hidden = true;
    } else {
      clearError();
    }
  }

  async function runScan(file){
    if(!file || !file.type || !file.type.startsWith("image/")){
      showError("That doesn't look like an image — try a screenshot instead.");
      return;
    }
    clearError();
    resultBox.hidden = true;
    setBusy(true, "Loading screenshot…");

    try{
      const dataUrl = await potScanFileToDataUrl(file);
      previewImg.src = dataUrl;
      const img = await potScanLoadImage(dataUrl);

      setBusy(true, "Reading the screenshot…");
      const worker = await potScanGetWorker();

      const pass1 = await worker.recognize(potScanCanvas(img, true));
      const parsed1 = potScanParse(pass1.data.text);

      setBusy(true, "Double-checking a few numbers…");
      const pass2 = await worker.recognize(potScanCanvas(img, false));
      const parsed = potScanMerge(parsed1, potScanParse(pass2.data.text), pass1.data.confidence, pass2.data.confidence);

      busy.hidden = true;
      previewWrap.hidden = false;
      showResult(parsed);
    } catch(err){
      busy.hidden = true;
      idle.hidden = false;
      showError("Something went wrong reading that screenshot. Try again, or enter the numbers below manually.");
    }
  }

  fileInput.addEventListener("change", () => { if(fileInput.files[0]) runScan(fileInput.files[0]); });

  ["dragenter","dragover"].forEach(evt => box.addEventListener(evt, e => {
    e.preventDefault(); box.classList.add("dragover");
  }));
  ["dragleave","drop"].forEach(evt => box.addEventListener(evt, e => {
    e.preventDefault(); box.classList.remove("dragover");
  }));
  box.addEventListener("drop", e => {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if(file) runScan(file);
  });

  document.addEventListener("paste", e => {
    if($("view-pot").hidden) return;
    const items = (e.clipboardData || {}).items || [];
    for(const it of items){
      if(it.type && it.type.startsWith("image/")){
        const file = it.getAsFile();
        if(file){ e.preventDefault(); runScan(file); }
        break;
      }
    }
  });

  removeBtn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); resetBox(); });

  applyBtn.addEventListener("click", () => {
    const statInput = statInputs[chosenStat];
    const statVal = statInput ? +statInput.value : NaN;
    const done = upDoneEl.value === "" ? NaN : +upDoneEl.value;
    const total = upTotalEl.value === "" ? NaN : +upTotalEl.value;

    if(!statInput || statInput.value === "" || isNaN(statVal)){
      applyError.hidden = false;
      applyError.textContent = `Enter a value for ${POT_SCAN_STAT_LABEL[chosenStat]} first — that's the stat picked above as this item's pot.`;
      statInput && statInput.focus();
      return;
    }

    applyError.hidden = true;
    $("potCurrent").value = Math.round(statVal);
    if(!isNaN(done)) $("potUpgradesDone").value = Math.round(done);
    if(!isNaN(total)) $("potUpgrades").value = Math.round(total);
    calculatePot();
  });
})();
