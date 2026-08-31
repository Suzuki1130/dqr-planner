const dungeonSel = $("dungeon");
let curDiff = null;

DUNGEONS.forEach((d,i) => {
  const o = document.createElement("option");
  o.value = i; o.textContent = d.name;
  dungeonSel.appendChild(o);
});

BOOSTS.forEach(b => {
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "pill"; btn.id = "b-" + b.id;
  btn.setAttribute("aria-pressed","false");
  btn.innerHTML = `<span>${b.name}</span><b>+${Math.round(b.add*100)}%</b>`;
  btn.addEventListener("click", () => {
    if(btn.dataset.excluded === "true") return;
    const on = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!on));
    if(!on && b.group){
      BOOSTS.forEach(o => {
        if(o.id !== b.id && o.group === b.group) $("b-"+o.id).setAttribute("aria-pressed","false");
      });
    }
    calculate();
  });
  $("boosts").appendChild(btn);
});
const boostOn = id => $("b-"+id).getAttribute("aria-pressed") === "true";

function updateBoostAvailability(d){
  const excluded = new Set(d.excludeBoosts || []);
  BOOSTS.forEach(b => {
    const btn = $("b-"+b.id);
    const isExcluded = excluded.has(b.id);
    btn.dataset.excluded = String(isExcluded);
    btn.title = isExcluded ? `${d.name} doesn't support ${b.name}.` : "";
    if(isExcluded) btn.setAttribute("aria-pressed","false");
  });
}

function buildTiers(keep){
  const d = DUNGEONS[+dungeonSel.value];
  updateBoostAvailability(d);
  const keys = Object.keys(d.runs);
  curDiff = keep && keys.includes(keep) ? keep : keys[keys.length - 1];
  const box = $("tiers");
  box.innerHTML = "";
  keys.forEach(k => {
    const c = tierColour(k);
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "tier"; btn.dataset.diff = k;
    btn.style.setProperty("--c", c);
    btn.style.setProperty("--c-rgb", hexRgb(c));
    btn.setAttribute("aria-pressed", String(k === curDiff));
    btn.innerHTML = `<span class="tname">${k}</span><span class="tval">—</span>`;
    btn.addEventListener("click", () => {
      curDiff = k;
      [...box.children].forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
      paint(tierColour(curDiff));
      calculate();
    });
    box.appendChild(btn);
  });
  paint(tierColour(curDiff));
}

function showBig(text, isMessage){
  const el = $("runs");
  el.classList.toggle("msg", !!isMessage);
  if(el.textContent !== text){
    el.textContent = text;
    el.classList.remove("beat"); void el.offsetWidth; el.classList.add("beat");
  }
}

function calculate(){
  const d = DUNGEONS[+dungeonSel.value];
  const from = Math.max(1, Math.floor(+$("fromLvl").value || 1));
  const to   = Math.floor(+$("toLvl").value || 0);
  const haveRaw = parseAmount($("haveXp").value);
  const bad = isNaN(haveRaw);
  const have = bad ? 0 : Math.max(0, haveRaw);
  const mins = Math.max(0, +$("minutes").value || 0);
  $("haveXp").style.borderColor = bad ? "var(--nightmare)" : "";

  const echo = $("haveXpEcho");
  const typed = $("haveXp").value.trim();
  if(!typed){ echo.textContent = ""; echo.classList.remove("bad"); }
  else if(bad){ echo.textContent = "not a number"; echo.classList.add("bad"); }
  else { echo.textContent = "= " + Math.max(0, haveRaw).toLocaleString() + " EXP"; echo.classList.remove("bad"); }

  let mult = 1;
  BOOSTS.forEach(b => { if(boostOn(b.id)) mult += b.add; });

  const base = d.runs[curDiff] || 0;
  const eff = base * mult;

  $("rMult").textContent = mult.toFixed(2) + "x";

  const on = BOOSTS.filter(b => boostOn(b.id));
  const bd = $("breakdown");
  bd.classList.toggle("on", on.length > 0);
  if(on.length){
    bd.innerHTML = "<h4>What's in the multiplier</h4>"
      + '<div class="brow"><span>Base</span><span>1.00</span></div>'
      + on.map(b => `<div class="brow"><span>${b.name}</span><span>+${b.add.toFixed(2)}</span></div>`).join("")
      + `<div class="brow total"><span>Total</span><span>${mult.toFixed(2)}x</span></div>`;
  }
  $("rEff").textContent = eff ? compact(eff) : "—";

  const valid = to > from;
  const gross = valid ? totalXpBetween(from, to) : 0;
  const need = valid ? Math.max(0, gross - have) : 0;
  $("rTotal").textContent = valid ? compact(need) : "—";

  [...$("tiers").children].forEach(btn => {
    const b = d.runs[btn.dataset.diff] * mult;
    btn.classList.toggle("blank", !d.runs[btn.dataset.diff]);
    btn.querySelector(".tval").textContent =
      !d.runs[btn.dataset.diff] ? "no EXP set"
      : !valid ? compact(d.runs[btn.dataset.diff]) + " a run"
      : b ? plural(Math.ceil(need / b))
      : "no EXP set";
  });

  if(bad){
    showBig("Check the EXP box — try something like 2.5M", true);
    $("runsSub").textContent = "";
    $("statTime").hidden = true;
    return;
  }
  if(!valid){
    showBig("Set a target level above your current one", true);
    $("runsSub").textContent = "";
    $("statTime").hidden = true;
    return;
  }
  if(!eff){
    showBig("No EXP filled in for this difficulty yet", true);
    $("runsSub").textContent = "";
    $("statTime").hidden = true;
    return;
  }

  const runs = Math.ceil(need / eff);
  showBig(runs.toLocaleString(), false);
  $("runsSub").textContent =
    `${d.name} · ${curDiff} · level ${from} → ${to}`;

  if(mins > 0 && runs > 0){
    $("rTime").textContent = timeText(runs * mins);
    $("statTime").hidden = false;
  } else $("statTime").hidden = true;

  store.set(KEY_CALC, JSON.stringify({
    d: dungeonSel.value, diff: curDiff, from, to, mins,
    b: BOOSTS.filter(x => boostOn(x.id)).map(x => x.id)
  }));
}

dungeonSel.addEventListener("change", () => { buildTiers(curDiff); calculate(); });
["minutes","fromLvl","toLvl","haveXp"].forEach(id => $(id).addEventListener("input", calculate));

(function restore(){
  let s = null;
  try { s = JSON.parse(store.get(KEY_CALC) || "null"); } catch(e){}
  if(s && DUNGEONS[+s.d]){
    dungeonSel.value = s.d;
    buildTiers(s.diff);
    $("fromLvl").value = s.from;
    $("toLvl").value = s.to;
    if(s.mins) $("minutes").value = s.mins;
    (s.b || []).forEach(id => {
      const el = $("b-" + (id === "potion" ? "expboost" : id));
      if(el && el.dataset.excluded !== "true") el.setAttribute("aria-pressed","true");
    });
  } else {
    buildTiers();
  }
  calculate();
})();
// Claude Did This