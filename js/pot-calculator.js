const POT_MODES = [
  { id:"gear", name:"Desert Temple → Winter Outpost", note:"Only accurate under ~200 upgrades/stats." },
  { id:"dungeon", name:"Pirate Island → Northern Lands", note:"Max pot = upgrades × 10 + current pot." }
];

let curPotMode = "gear";
const KEY_POT = "dqr.pot.v1";

POT_MODES.forEach(m => {
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "tier"; btn.dataset.mode = m.id;
  btn.setAttribute("aria-pressed", String(m.id === curPotMode));
  btn.innerHTML = `<span class="tname">${m.name}</span>`;
  btn.addEventListener("click", () => {
    curPotMode = m.id;
    [...$("potModes").children].forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
    calculatePot();
  });
  $("potModes").appendChild(btn);
});

function gearPot(start, upgrades){
  let S = start;
  for(let i = 0; i < upgrades; i++) S += Math.min(10, Math.floor(S / 20));
  return S;
}
// This is the formula for dungeons desert temple to winter outpost
// since it doesnt follow the upgrades * 10 + current pot rule
// For python the code is import math
//S = 1175              # current pot
//for i in range(131):  # current upgrade level
//  S += min(10, math.floor(S / 20))
//print(S)

function dungeonPot(start, upgrades){
  return start + upgrades * 10;
}
// this is the formula we normally use for dungeons pirate island to current ones
function showPotResult(text, isMessage){
  const el = $("potResult");
  el.classList.toggle("msg", !!isMessage);
  if(el.textContent !== text){
    el.textContent = text;
    el.classList.remove("beat"); void el.offsetWidth; el.classList.add("beat");
  }
}

function calculatePot(){
  const mode = POT_MODES.find(m => m.id === curPotMode);
  $("potModeHelp").textContent = mode.note;

  const start = Math.floor(+$("potCurrent").value);
  const upgrades = Math.floor(+$("potUpgrades").value);
  const bad = isNaN(start) || isNaN(upgrades) || start < 0 || upgrades < 0;

  $("potCurrent").style.borderColor = bad ? "var(--nightmare)" : "";
  $("potUpgrades").style.borderColor = bad ? "var(--nightmare)" : "";

  if(bad){
    showPotResult("Enter a current pot and upgrade count of 0 or more", true);
    $("potSub").textContent = "";
    $("potFormula").textContent = "—";
    return;
  }

  const result = curPotMode === "gear" ? gearPot(start, upgrades) : dungeonPot(start, upgrades);
  showPotResult(compact(result), false);
  $("potSub").textContent = `${mode.name} · ${start.toLocaleString()} pot + ${upgrades.toLocaleString()} upgrades`;
  $("potFormula").textContent = curPotMode === "gear"
    ? "S += min(10, ⌊S/20⌋)"
    : "upgrades × 10 + pot";

  store.set(KEY_POT, JSON.stringify({ mode: curPotMode, start, upgrades }));
}

["potCurrent","potUpgrades"].forEach(id => $(id).addEventListener("input", calculatePot));

(function restorePot(){
  let s = null;
  try { s = JSON.parse(store.get(KEY_POT) || "null"); } catch(e){}
  if(s && POT_MODES.some(m => m.id === s.mode)){
    curPotMode = s.mode;
    [...$("potModes").children].forEach(x => x.setAttribute("aria-pressed", String(x.dataset.mode === s.mode)));
    $("potCurrent").value = s.start;
    $("potUpgrades").value = s.upgrades;
  }
  calculatePot();
})();
