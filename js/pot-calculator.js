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

// --- upgrade gold cost -----------------------------------------------------
// Reverse-engineered from live in-game upgrade prices and cross-checked
// against Dungeon Bot's calc-pot totals (exact match on every real item
// tested so far):
//   upgrades 0-23   fixed ramp-up table (GOLD_RAMP below)
//   upgrades 24-465 cost(n) = 220n - 2335          (confirmed exact)
//   upgrades 466+   cost(n) = 100,000 flat per upgrade (confirmed exact)
// GOLD_RAMP[n] is the gold cost to go from upgrade n to n+1. Values at
// n = 0-6, 10, 20-23 are read straight off the live upgrade panel; the rest
// (7-9, 11-19) are estimated by interpolation, then nudged so the table's
// total across 0-23 lands on exactly 27,415 gold -- solved for by matching
// two real full-upgrade totals from Dungeon Bot. So the *total* through
// upgrade 24 is exact; only the split between those unlogged steps carries
// a little slack (at most a couple hundred gold).
const GOLD_RAMP = [
  100, 156, 215, 278, 344, 415, 490, 552, 636, 719, 838, 929,
  1055, 1182, 1308, 1435, 1561, 1688, 1814, 1942, 2159, 2339, 2529, 2731
];
const GOLD_RAMP_CUM = (() => {
  const cum = [0];
  for(let n = 0; n < GOLD_RAMP.length; n++) cum.push(cum[n] + GOLD_RAMP[n]);
  return cum;
})();
const GOLD_CAP_START = 466;
const GOLD_CAP_RATE = 100000;

function goldCostAt(n){
  n = Math.floor(n);
  if(n < 0) return 0;
  if(n < GOLD_RAMP.length) return GOLD_RAMP[n];
  return Math.min(220 * n - 2335, GOLD_CAP_RATE);
}

function cumulativeGold(k){
  k = Math.max(0, Math.floor(k));
  if(k <= 24) return GOLD_RAMP_CUM[k];
  if(k <= GOLD_CAP_START) return GOLD_RAMP_CUM[24] + (k - 24) * (110 * k + 195);
  return GOLD_CAP_RATE * k - 23829475;
}

function goldCostRange(from, to){
  from = Math.max(0, Math.floor(from));
  to = Math.max(from, Math.floor(to));
  return cumulativeGold(to) - cumulativeGold(from);
}

function showGoldResult(text, isMessage){
  const el = $("goldResult");
  const num = el.querySelector(".num");
  el.classList.toggle("msg", !!isMessage);
  if(num.textContent !== text){
    num.textContent = text;
    if(!isMessage) sizeBigNum(num); else num.style.fontSize = "";
    el.classList.remove("beat"); void el.offsetWidth; el.classList.add("beat");
  }
}
// -----------------------------------------------------------------------

function showPotResult(text, isMessage){
  const el = $("potResult");
  const num = el.querySelector(".num");
  el.classList.toggle("msg", !!isMessage);
  if(num.textContent !== text){
    num.textContent = text;
    if(!isMessage) sizeBigNum(num); else num.style.fontSize = "";
    el.classList.remove("beat"); void el.offsetWidth; el.classList.add("beat");
  }
}

function calculatePot(){
  const mode = POT_MODES.find(m => m.id === curPotMode);
  $("potModeHelp").textContent = mode.note;

  const start = Math.floor(+$("potCurrent").value);
  const total = Math.floor(+$("potUpgrades").value);
  const done = Math.floor(+$("potUpgradesDone").value);
  const bad = isNaN(start) || isNaN(total) || isNaN(done) || start < 0 || total < 0 || done < 0;

  $("potCurrent").style.borderColor = bad ? "var(--nightmare)" : "";
  $("potUpgrades").style.borderColor = bad ? "var(--nightmare)" : "";
  $("potUpgradesDone").style.borderColor = bad ? "var(--nightmare)" : "";

  if(bad){
    showPotResult("Enter a current pot and upgrade counts of 0 or more", true);
    $("potSub").textContent = "";
    $("potFormula").textContent = "—";
    showGoldResult("—", true);
    $("goldSub").textContent = "";
    $("goldNext").textContent = "—";
    $("goldFormula").textContent = "—";
    return;
  }

  // only the upgrades left matter, done ones are already baked into current pot
  const left = Math.max(0, total - done);
  const result = curPotMode === "gear" ? gearPot(start, left) : dungeonPot(start, left);
  showPotResult(Math.round(result).toLocaleString(), false);
  $("potSub").textContent = `${mode.name} · ${start.toLocaleString()} pot + ${left.toLocaleString()} upgrades left (${done.toLocaleString()}/${total.toLocaleString()} done)`;
  $("potFormula").textContent = curPotMode === "gear"
    ? "S += min(10, ⌊S/20⌋)"
    : "upgrades × 10 + pot";

  // gold cost uses the same "already upgraded" -> "upgrades needed" range,
  // independent of which pot mode/formula is selected above
  const goldCost = goldCostRange(done, total);
  showGoldResult(Math.round(goldCost).toLocaleString(), false);
  $("goldSub").textContent = `${done.toLocaleString()} → ${total.toLocaleString()} · ${left.toLocaleString()} upgrade${left === 1 ? "" : "s"} left`;
  $("goldNext").textContent = left > 0 ? goldCostAt(done).toLocaleString() + " gold" : "—";
  $("goldFormula").textContent = left <= 0
    ? "already at or past target"
    : done >= GOLD_CAP_START
      ? "100,000 / upgrade (capped)"
      : done >= GOLD_RAMP.length
        ? "220n − 2,335, capping at 100,000"
        : "fixed ramp-up table";

  store.set(KEY_POT, JSON.stringify({ mode: curPotMode, start, total, done }));
}

["potCurrent","potUpgrades","potUpgradesDone"].forEach(id => $(id).addEventListener("input", calculatePot));

(function restorePot(){
  let s = null;
  try { s = JSON.parse(store.get(KEY_POT) || "null"); } catch(e){}
  if(s && POT_MODES.some(m => m.id === s.mode)){
    curPotMode = s.mode;
    [...$("potModes").children].forEach(x => x.setAttribute("aria-pressed", String(x.dataset.mode === s.mode)));
    $("potCurrent").value = s.start;
    $("potUpgrades").value = s.total ?? s.upgrades ?? 0;
    $("potUpgradesDone").value = s.done ?? 0;
  }
  calculatePot();
})();
