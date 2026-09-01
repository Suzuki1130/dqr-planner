const DIFF_ORDER = ["Easy","Medium","Hard","Insane","Nightmare","Nightmare + Rodin","Tier 30"];

function buildExpTable(){
  const cols = DIFF_ORDER.filter(k => DUNGEONS.some(d => k in d.runs));

  const head = $("expHead");
  head.innerHTML = "<th>Dungeon</th>" + cols.map(c => `<th>${c}</th>`).join("");

  const body = $("expBody");
  body.innerHTML = "";
  DUNGEONS.forEach(d => {
    const tr = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.className = "dname";
    const badge = d.pending ? '<span class="pending">checking</span>'
                : d.note    ? '<span class="watch">watch</span>'
                : "";
    nameCell.innerHTML = d.name + badge;
    if(d.note) nameCell.title = d.note;
    tr.appendChild(nameCell);
    cols.forEach(c => {
      const td = document.createElement("td");
      const v = d.runs[c];
      td.className = "val " + (v ? "set" : "blank");
      td.dataset.label = c;
      td.textContent = v ? compact(v) : "—";
      if(v) td.title = fmtVal(v) + " EXP";
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });

  const notesBox = $("expNotes");
  notesBox.innerHTML = "";
  DUNGEONS.filter(d => d.note).forEach(d => {
    const w = document.createElement("div");
    w.className = "warn";
    w.innerHTML = `<b>${d.name}:</b> ${d.note}`;
    notesBox.appendChild(w);
  });
}
buildExpTable();

function buildRaidInfo(){
  const r = BOSS_RAID;
  const vip = BOOSTS.find(b => b.id === "vip").add;
  const boost = BOOSTS.find(b => b.id === "expboost").add;

  const xpLine = r.xp
    ? `<span class="val set" style="font-family:var(--mono)">${compact(r.xp)}</span> EXP per clear, same for every tier.`
    : `<span class="pending">no XP yet</span> — EXP per clear hasn't been logged yet.`;

  const excludedNames = (r.excludeBoosts || []).map(id => BOOSTS.find(b => b.id === id)?.name || id);
  const noBoostLine = excludedNames.length
    ? `<p class="help"><b>No ${excludedNames.join(" / ")}.</b> Boss Raid doesn't support that mode, so it's greyed out and locked off on the Run Calculator when Boss Raid is selected — following the old wiki's Boss Raid (Legacy) page. VIP, Solo, EXP Boost and events still apply normally.</p>`
    : "";

  const strip = r.xp ? `
    <div class="strip" style="border-top:1px solid var(--edge);padding-top:14px;margin-top:14px">
      <div class="stat"><span class="sl">Base</span><span class="sv">${compact(r.xp)}</span></div>
      <div class="stat"><span class="sl">+ VIP</span><span class="sv">${compact(r.xp * (1 + vip))}</span></div>
      <div class="stat"><span class="sl">+ Boost</span><span class="sv">${compact(r.xp * (1 + boost))}</span></div>
      <div class="stat"><span class="sl">+ VIP &amp; Boost</span><span class="sv">${compact(r.xp * (1 + vip + boost))}</span></div>
    </div>` : "";

  const pendingBadge = r.pending ? '<span class="pending">checking</span>' : "";
  const pendingLine = r.pending ? " Everything below is still being double-checked." : "";

  $("raidInfo").innerHTML = `
    <h2 class="sectitle">Boss Raids${pendingBadge}</h2>
    <p class="help" style="margin:0 0 10px">Also in the table above as its own row, under a "Tier 30" column since raids run on a different ladder than dungeon difficulties.${pendingLine} What's known so far:</p>
    <p class="help"><b>Unlocks at level ${r.levelReq}</b> — ${r.tier}.</p>
    <p class="help"><b>EXP only counts up to level ${r.xpCapLevel}.</b> Past that, raid clears stop granting level-up EXP, so it isn't possible to skip the regular dungeons by grinding raids alone. — ${r.source}</p>
    <p class="help">${r.tierNote}</p>
    ${noBoostLine}
    <p class="help" style="margin-top:10px">${xpLine}</p>
    ${strip}
  `;
}
buildRaidInfo();

const EXP_SHEET_ID = "1_3BmMT_UAX4IEjvcfWR5f2ylWV7oZOW80luDvkPaMUs";
const EXP_SHEET_GID = "0";
const EXP_SHEET_URL = `https://docs.google.com/spreadsheets/d/${EXP_SHEET_ID}/edit?gid=${EXP_SHEET_GID}#gid=${EXP_SHEET_GID}`;
const EXP_SNAPSHOT_DATE = "29 Aug 2026";

const STATIC_BY_ABBR = Object.fromEntries(DUNGEONS.map(d => [d.abbr, d]));

function parseExpCell(v){
  if(v === "" || v === null || v === undefined) return null;
  const s = String(v).replace(/,/g,"").trim();
  if(!s || s.toUpperCase() === "NA") return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function normaliseColumnKey(raw){
  const key = (raw || "").trim();
  if(key === "T1~T30") return "Tier 30";
  if(/nightmare.*(rodin|odin)/i.test(key)) return "Nightmare + Rodin";
  return key;
}

function buildDungeonsFromSheet(cols, rows){
  const out = [];
  rows.forEach(row => {
    const raw = (row[0] ?? "").toString().trim();
    const m = raw.match(/^([A-Za-z]{2})\s*(?:\((.*)\))?\s*$/);
    if(!m) return;
    const abbr = m[1].toUpperCase();
    const flag = (m[2] || "").trim();

    const runs = {};
    for(let i = 1; i < row.length; i++){
      const key = normaliseColumnKey(cols[i]);
      if(!key) continue;
      const n = parseExpCell(row[i]);
      if(n !== null) runs[key] = n;
    }

    const base = STATIC_BY_ABBR[abbr];
    const name = base ? base.name : (DUNGEON_ABBR[abbr] || abbr);
    const mergedRuns = base ? { ...base.runs, ...runs } : runs;
    const entry = base ? { ...base, runs: mergedRuns } : { name, abbr, runs };
    delete entry.note;
    delete entry.pending;

    if(flag){
      if(/check/i.test(flag)) entry.pending = true;
      entry.note = `Flagged "${flag}" on the spreadsheet.`;
    } else if(!Object.keys(runs).length){
      entry.note = "No EXP logged on the spreadsheet yet.";
    }

    out.push(entry);
  });
  return out;
}

function refreshFromDungeons(){
  const br = DUNGEONS.find(d => d.abbr === "BR");
  if(br && br.runs["Tier 30"]) BOSS_RAID.xp = br.runs["Tier 30"];

  const keepName = dungeonSel.options[dungeonSel.selectedIndex]?.textContent;
  dungeonSel.innerHTML = "";
  DUNGEONS.forEach((d,i) => {
    const o = document.createElement("option");
    o.value = i; o.textContent = d.name;
    dungeonSel.appendChild(o);
  });
  const restoreIdx = DUNGEONS.findIndex(d => d.name === keepName);
  dungeonSel.value = restoreIdx >= 0 ? restoreIdx : 0;

  buildTiers(curDiff);
  buildExpTable();
  buildRaidInfo();
  calculate();
}

function loadLiveExp(){
  $("expLiveStatus").innerHTML = `<p class="help" style="margin:0">Loading live values from the spreadsheet…</p>`;

  const cb = "__dqrExpCb" + Date.now();
  let done = false;
  const bail = () => {
    if(done) return; done = true; cleanup();
    $("expLiveStatus").innerHTML = `<p class="help" style="margin:0"><b style="color:var(--nightmare)">&#9679; Snapshot</b> — couldn't reach the live spreadsheet just now, showing the saved values from ${EXP_SNAPSHOT_DATE}. <a href="${EXP_SHEET_URL}" target="_blank" rel="noopener">Open the spreadsheet directly</a> for the latest, or <button type="button" class="btn-quiet" id="expRetry" style="padding:2px 10px;font-size:11.5px;vertical-align:middle">retry</button>.</p>`;
    const retry = $("expRetry");
    if(retry) retry.addEventListener("click", loadLiveExp);
  };
  const timer = setTimeout(bail, 8000);

  function cleanup(){
    clearTimeout(timer);
    delete window[cb];
    if(script.parentNode) script.parentNode.removeChild(script);
  }

  window[cb] = function(resp){
    if(done) return;
    try {
      const table = resp.table;
      const cols = table.cols.map(c => c.label || "");
      const rows = table.rows.map(r => r.c.map(cell => (cell && (cell.f ?? cell.v) != null) ? cell.f ?? cell.v : ""));
      const live = buildDungeonsFromSheet(cols, rows);
      if(live.length){
        done = true;
        DUNGEONS = live;
        refreshFromDungeons();
        $("expLiveStatus").innerHTML = `<p class="help" style="margin:0"><b style="color:var(--easy)">&#9679; Live</b> — reading straight from the spreadsheet right now.</p>`;
      } else bail();
    } catch(e){ bail(); }
    cleanup();
  };

  const script = document.createElement("script");
  script.src = `https://docs.google.com/spreadsheets/d/${EXP_SHEET_ID}/gviz/tq?gid=${EXP_SHEET_GID}&headers=1&tqx=out:json;responseHandler:${cb}`;
  script.onerror = bail;
  document.body.appendChild(script);
}
// Claude did all of these
