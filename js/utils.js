const $ = id => document.getElementById(id);

// only ever writes your last calculator picks (dungeon, difficulty, levels, boosts) to
// localStorage under KEY_CALC below — nothing leaves the device, no analytics tied to it
const store = (() => {
  const mem = {};
  let ok = true;
  try { localStorage.setItem("__t","1"); localStorage.removeItem("__t"); }
  catch(e){ ok = false; }
  return {
    ok,
    get(k){ try { return ok ? localStorage.getItem(k) : (mem[k] ?? null); } catch(e){ return mem[k] ?? null; } },
    set(k,v){ try { ok ? localStorage.setItem(k,v) : (mem[k]=v); } catch(e){ mem[k]=v; } }
  };
})();
const KEY_CALC = "dqr.calc.v1";

if(!store.ok){
  const w = document.createElement("div");
  w.className = "warn";
  w.textContent = "This browser is blocking local storage, so your calculator settings won't survive a refresh. Turn off private browsing or allow site data.";
  $("view-calc").prepend(w);
}

const hexRgb = h => {
  const n = parseInt(h.replace("#",""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(",");
};
const tierColour = k => TIER_COLOUR[String(k).toLowerCase()] || "#5b93ba";
function paint(colour){
  document.documentElement.style.setProperty("--tier", colour);
  document.documentElement.style.setProperty("--tier-rgb", hexRgb(colour));
  const m = document.querySelector('meta[name=theme-color]');
  if(m) m.setAttribute("content", "#1d1d1b");
}

function compact(n){
  if(!isFinite(n)) return "—";
  const u = [[1e15,"Q"],[1e12,"T"],[1e9,"B"],[1e6,"M"],[1e3,"K"]];
  for(const [v,s] of u){
    if(Math.abs(n) >= v){
      let t = (n/v).toFixed(Math.abs(n/v) >= 100 ? 0 : 2);
      if(t.includes(".")) t = t.replace(/0+$/,"").replace(/\.$/,"");
      return t + s;
    }
  }
  return Math.round(n).toLocaleString();
}

function fmtVal(n){
  if(!n) return "";
  return n.toLocaleString();
}

function totalXpBetween(from, to){
  let sum = 0;
  for(let l = from; l < to; l++) sum += xpForLevel(l);
  return sum;
}

const SUFFIX = {
  k:1e3, m:1e6, b:1e9, t:1e12,
  q:1e15, qa:1e15, qi:1e18, sx:1e21, sp:1e24, oc:1e27, no:1e30, dc:1e33
};
function parseAmount(raw){
  const s = String(raw || "").trim().toLowerCase().replace(/[,\s_]/g,"");
  if(!s) return 0;
  const m = s.match(/^(\d*\.?\d+)([a-z]*)$/);
  if(!m) return NaN;
  const suf = m[2];
  if(suf && !(suf in SUFFIX)) return NaN;
  return parseFloat(m[1]) * (suf ? SUFFIX[suf] : 1);
}

const plural = n => n.toLocaleString() + (n === 1 ? " run" : " runs");

function timeText(mins){
  const total = Math.round(mins);
  const d = Math.floor(total / 1440), h = Math.floor((total % 1440) / 60), m = total % 60;
  if(d) return `${d}d ${h}h`;
  if(h) return `${h}h ${m}m`;
  return `${m}m`;
}
// Claude did this part