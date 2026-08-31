const SHEET_ID = "1AoM7H3rLFCa_vtBXQfYhWOFiArUZdcavHCibNfZwkGo";
const SHEET_GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}`;

function renderPricesTable(cols, rows, meta){
  const head = $("pricesHead");
  head.innerHTML = cols.map(c => `<th>${c || ""}</th>`).join("");

  const body = $("pricesBody");
  body.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    r.forEach((cell, i) => {
      const td = document.createElement("td");
      const v = (cell ?? "").toString().trim();
      td.dataset.label = (cols[i] || "").trim();
      if(i === 0){
        td.className = "dname";
        const full = DUNGEON_ABBR[v];
        td.textContent = full ? `${full} (${v})` : (v || "—");
      } else {
        const blank = !v || v.toUpperCase() === "NA";
        td.className = "val " + (blank ? "blank" : "set");
        td.textContent = blank ? "—" : v;
      }
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });

  $("pricesStatus").innerHTML = meta.live
    ? `<p class="help" style="margin:0"><b style="color:var(--easy)">&#9679; Live</b> — reading straight from the spreadsheet right now.</p>`
    : `<p class="help" style="margin:0"><b style="color:var(--nightmare)">&#9679; Snapshot</b> — couldn't reach the live spreadsheet just now, showing a saved copy from ${meta.savedOn}. <a href="${SHEET_URL}" target="_blank" rel="noopener">Open the spreadsheet directly</a> for the latest, or <button type="button" class="btn-quiet" id="pricesRetry" style="padding:2px 10px;font-size:11.5px;vertical-align:middle">retry</button>.</p>`;

  const retry = $("pricesRetry");
  if(retry) retry.addEventListener("click", loadLiveSheet);
}

function looksLikeDungeonRow(row){
  const first = (row[0] ?? "").toString().trim();
  return /^[A-Za-z]{1,6}$/.test(first);
}

function loadLiveSheet(){
  renderPricesTable(PRICE_SNAPSHOT.cols, PRICE_SNAPSHOT.rows, {live:false, savedOn:PRICE_SNAPSHOT.savedOn});
  $("pricesStatus").innerHTML = `<p class="help" style="margin:0">Loading live data from the spreadsheet…</p>`;

  const cb = "__dqrSheetCb" + Date.now();
  let done = false;
  const bail = () => { if(!done){ done = true; cleanup(); renderPricesTable(PRICE_SNAPSHOT.cols, PRICE_SNAPSHOT.rows, {live:false, savedOn:PRICE_SNAPSHOT.savedOn}); } };
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
      const cols = table.cols.map((c,i) => c.label || PRICE_SNAPSHOT.cols[i] || "");
      const rows = table.rows
        .map(r => r.c.map(cell => (cell && (cell.f ?? cell.v) != null) ? cell.f ?? cell.v : ""))
        .filter(looksLikeDungeonRow);
      if(rows.length){
        done = true;
        renderPricesTable(cols, rows, {live:true});
      } else {
        bail();
      }
    } catch(e){
      bail();
    }
    cleanup();
  };

  const script = document.createElement("script");
  script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&headers=1&tqx=out:json;responseHandler:${cb}`;
  script.onerror = bail;
  document.body.appendChild(script);
}
loadLiveSheet();
// Claude did this part