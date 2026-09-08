const SHEET_ID = "1AoM7H3rLFCa_vtBXQfYhWOFiArUZdcavHCibNfZwkGo";
const SHEET_GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}`;

let pricesCols = [];
let pricesRows = [];
let pricesSearchTerm = "";
let pricesSort = { col: null, dir: 1 };

function priceCellValue(row, i){
  const v = (row[i] ?? "").toString().trim();
  return !v || v.toUpperCase() === "NA" ? null : v;
}

function priceDisplayName(row){
  const v = (row[0] ?? "").toString().trim();
  const full = DUNGEON_ABBR[v];
  return full ? `${full} (${v})` : (v || "");
}

function sortedFilteredPrices(){
  let rows = pricesRows.slice();

  if(pricesSearchTerm){
    const q = pricesSearchTerm.toLowerCase();
    rows = rows.filter(r => priceDisplayName(r).toLowerCase().includes(q));
  }

  if(pricesSort.col !== null){
    const col = pricesSort.col, dir = pricesSort.dir;
    rows.sort((a,b) => {
      if(col === 0) return priceDisplayName(a).localeCompare(priceDisplayName(b)) * dir;
      const av = priceCellValue(a, col), bv = priceCellValue(b, col);
      if(av == null && bv == null) return 0;
      if(av == null) return 1;
      if(bv == null) return -1;
      const an = parseAmount(av), bn = parseAmount(bv);
      if(isNaN(an) || isNaN(bn)) return String(av).localeCompare(String(bv)) * dir;
      return (an - bn) * dir;
    });
  }

  return rows;
}

function renderPricesBody(){
  const head = $("pricesHead");
  head.innerHTML = "";
  pricesCols.forEach((c,i) => {
    const th = document.createElement("th");
    th.className = "sortable";
    const arrow = pricesSort.col === i ? (pricesSort.dir === 1 ? "↑" : "↓") : "";
    th.innerHTML = `${c || ""}<span class="arrow">${arrow}</span>`;
    th.dataset.sort = pricesSort.col === i ? (pricesSort.dir === 1 ? "asc" : "desc") : "none";
    th.addEventListener("click", () => {
      if(pricesSort.col === i) pricesSort.dir *= -1;
      else { pricesSort.col = i; pricesSort.dir = 1; }
      renderPricesBody();
    });
    head.appendChild(th);
  });

  const rows = sortedFilteredPrices();

  const body = $("pricesBody");
  body.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    r.forEach((cell, i) => {
      const td = document.createElement("td");
      const v = (cell ?? "").toString().trim();
      td.dataset.label = (pricesCols[i] || "").trim();
      if(i === 0){
        td.className = "dname";
        td.textContent = priceDisplayName(r) || "—";
      } else {
        const blank = !v || v.toUpperCase() === "NA";
        td.className = "val " + (blank ? "blank" : "set");
        td.textContent = blank ? "—" : v;
      }
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });

  const countEl = $("pricesCount");
  if(countEl){
    countEl.textContent = rows.length === pricesRows.length
      ? `${pricesRows.length} dungeons`
      : `${rows.length} of ${pricesRows.length} dungeons`;
  }
}

function renderPricesTable(cols, rows, meta){
  pricesCols = cols;
  pricesRows = rows;
  renderPricesBody();

  $("pricesStatus").innerHTML = meta.live
    ? `<p class="help" style="margin:0"><b class="badge-live">&#9679; Live</b> — reading straight from the spreadsheet right now.</p>`
    : `<p class="help" style="margin:0"><b class="badge-snap">&#9679; Snapshot</b> — couldn't reach the live spreadsheet just now, showing a saved copy from ${meta.savedOn}. <a href="${SHEET_URL}" target="_blank" rel="noopener">Open the spreadsheet directly</a> for the latest, or <button type="button" class="btn-quiet" id="pricesRetry" style="padding:2px 10px;font-size:11.5px;vertical-align:middle">retry</button>.</p>`;

  const retry = $("pricesRetry");
  if(retry) retry.addEventListener("click", loadLiveSheet);
}

const pricesSearchInput = $("pricesSearch");
const pricesSearchClear = $("pricesSearchClear");
if(pricesSearchInput){
  pricesSearchInput.addEventListener("input", () => {
    pricesSearchTerm = pricesSearchInput.value.trim();
    pricesSearchClear.hidden = !pricesSearchTerm;
    renderPricesBody();
  });
  pricesSearchClear.addEventListener("click", () => {
    pricesSearchInput.value = "";
    pricesSearchTerm = "";
    pricesSearchClear.hidden = true;
    renderPricesBody();
    pricesSearchInput.focus();
  });
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
