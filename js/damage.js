const DAMAGE_INNER_MODES = [
  { id: "none", name: "Without Inner", mult: 1.0 },
  { id: "with", name: "With Inner", mult: 1.8 },
  { id: "enhanced", name: "With Enhanced Inner", mult: 1.9 }
];

const DAMAGE_DEFAULTS = {
  weapon: 73279273,
  armor: 6945538,
  helmet: 7131930,
  skill: 199,
  spellDungeonAbbr: "NL",
  spellKey: "Mage:1",
  spellMultiplier: 119,
  inner: "enhanced"
};

const KEY_DAMAGE = "dqr.damage.v1";

function calculateBaseDamage(weaponPot, armorPot, helmetPot, skillPoints, spellMultiplier) {
  return (
    weaponPot *
    (0.6597 + 0.013202 * skillPoints) *
    ((armorPot + helmetPot) * 0.0028)
  ) * spellMultiplier;
}

function calculateFinalDamage(baseDamage, innerMultiplier) {
  return baseDamage * innerMultiplier;
}

function formatDamageCompact(n) {
  if (!isFinite(n)) return "—";
  const u = [[1e15, "Q"], [1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];
  for (const [v, s] of u) {
    if (Math.abs(n) >= v) return "~" + (n / v).toFixed(3) + s;
  }
  return "~" + Math.round(n).toLocaleString();
}

function formatExact(n) {
  if (!isFinite(n)) return "—";
  const rounded = Number(n.toFixed(6));
  const [i, f] = rounded.toString().split(".");
  const iFmt = Number(i).toLocaleString();
  return f ? `${iFmt}.${f}` : iFmt;
}

let curInnerMode = DAMAGE_DEFAULTS.inner;
let curSpellMultiplier = null;
let curSpellNote = null;
let curSpellDungeonIndex = "";
let curSpellKey = "";

(function buildInnerModes() {
  const box = $("dmgInnerModes");
  if (!box) return;
  DAMAGE_INNER_MODES.forEach(m => {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "tier"; btn.dataset.mode = m.id;
    btn.setAttribute("aria-pressed", String(m.id === curInnerMode));
    btn.innerHTML = `<span class="tname">${m.name}</span><span class="tval">${m.mult.toFixed(2)}x</span>`;
    btn.addEventListener("click", () => {
      curInnerMode = m.id;
      [...box.children].forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
      calculateDamage();
    });
    box.appendChild(btn);
  });
})();

(function buildSpellPicker() {
  const dungeonSel = $("dmgSpellDungeon");
  const spellSel = $("dmgSpellPick");
  if (!dungeonSel || !spellSel || typeof DAMAGE_SPELL_DUNGEONS === "undefined") return;

  const opt = (value, label) => { const o = document.createElement("option"); o.value = value; o.textContent = label; return o; };

  dungeonSel.appendChild(opt("", "Select a dungeon…"));
  DAMAGE_SPELL_DUNGEONS.forEach((d, i) => dungeonSel.appendChild(opt(String(i), d.name)));

  function updateMultEcho() {
    const echo = $("dmgSpellMultEcho");
    if (!echo) return;
    echo.textContent = curSpellMultiplier != null ? `Multiplier: ${curSpellMultiplier}x` : "";
  }

  function updateSpellNote() {
    const wrap = $("dmgSpellNoteWrap");
    const note = $("dmgSpellNote");
    if (!wrap || !note) return;
    if (curSpellNote) {
      note.textContent = curSpellNote;
      wrap.hidden = false;
    } else {
      note.textContent = "";
      wrap.hidden = true;
    }
  }

  function rebuildSpells() {
    spellSel.innerHTML = "";
    const d = DAMAGE_SPELL_DUNGEONS[+dungeonSel.value];
    if (!d) {
      spellSel.appendChild(opt("", "—"));
      spellSel.disabled = true;
      return;
    }
    spellSel.disabled = false;
    spellSel.appendChild(opt("", "Pick a spell…"));
    const group = (label, list) => {
      if (!list || !list.length) return;
      const og = document.createElement("optgroup");
      og.label = label;
      list.forEach((s, i) => {
        const diff = s.difficulty ? ` (${s.difficulty})` : "";
        og.appendChild(opt(`${label}:${i}`, `${s.name} — ${s.mult}x${diff}`));
      });
      spellSel.appendChild(og);
    };
    group("Warrior", d.warrior);
    group("Mage", d.mage);
  }

  dungeonSel.addEventListener("change", () => {
    curSpellDungeonIndex = dungeonSel.value;
    curSpellKey = "";
    curSpellMultiplier = null;
    curSpellNote = null;
    rebuildSpells();
    updateMultEcho();
    updateSpellNote();
    calculateDamage();
  });
  spellSel.addEventListener("change", () => {
    const d = DAMAGE_SPELL_DUNGEONS[+dungeonSel.value];
    if (!d || !spellSel.value) { curSpellMultiplier = null; curSpellNote = null; updateMultEcho(); updateSpellNote(); calculateDamage(); return; }
    const [group, idx] = spellSel.value.split(":");
    const list = group === "Warrior" ? d.warrior : d.mage;
    const spell = list && list[+idx];
    curSpellMultiplier = spell ? spell.mult : null;
    curSpellNote = spell && spell.note ? spell.note : null;
    curSpellKey = spellSel.value;
    updateMultEcho();
    updateSpellNote();
    calculateDamage();
  });

  function applyDefaultPick() {
    const idx = DAMAGE_SPELL_DUNGEONS.findIndex(d => d.abbr === DAMAGE_DEFAULTS.spellDungeonAbbr);
    if (idx < 0) return;
    dungeonSel.value = String(idx);
    curSpellDungeonIndex = String(idx);
    rebuildSpells();
    spellSel.value = DAMAGE_DEFAULTS.spellKey;
    curSpellKey = DAMAGE_DEFAULTS.spellKey;
    curSpellMultiplier = DAMAGE_DEFAULTS.spellMultiplier;
    const [group, idx2] = DAMAGE_DEFAULTS.spellKey.split(":");
    const list = group === "Warrior" ? DAMAGE_SPELL_DUNGEONS[idx].warrior : DAMAGE_SPELL_DUNGEONS[idx].mage;
    const spell = list && list[+idx2];
    curSpellNote = spell && spell.note ? spell.note : null;
    updateMultEcho();
    updateSpellNote();
  }

  rebuildSpells();
  applyDefaultPick();

  window.__dmgApplyDefaultPick = applyDefaultPick;
  window.__dmgUpdateMultEcho = updateMultEcho;
  window.__dmgUpdateSpellNote = updateSpellNote;
  window.__dmgRebuildSpells = rebuildSpells;
})();

function showDamageResult(text, isMessage) {
  const el = $("dmgResult");
  const num = el.querySelector(".num");
  el.classList.toggle("msg", !!isMessage);
  if (num.textContent !== text) {
    num.textContent = text;
    if (!isMessage) sizeBigNum(num); else num.style.fontSize = "";
    el.classList.remove("beat"); void el.offsetWidth; el.classList.add("beat");
  }
}

function calculateDamage() {
  if (!$("dmgWeapon")) return;

  const raw = {
    weapon: $("dmgWeapon").value,
    armor: $("dmgArmor").value,
    helmet: $("dmgHelmet").value,
    skill: $("dmgSkill").value
  };
  const weapon = +raw.weapon, armor = +raw.armor, helmet = +raw.helmet, skill = +raw.skill;

  const missing = v => v === "" || v === null;
  const checks = [
    { el: $("dmgWeapon"), ok: !missing(raw.weapon) && !isNaN(weapon) && weapon >= 0 },
    { el: $("dmgArmor"), ok: !missing(raw.armor) && !isNaN(armor) && armor >= 0 },
    { el: $("dmgHelmet"), ok: !missing(raw.helmet) && !isNaN(helmet) && helmet >= 0 },
    { el: $("dmgSkill"), ok: !missing(raw.skill) && !isNaN(skill) && skill >= 0 },
    { el: $("dmgSpellPick"), ok: curSpellMultiplier != null && curSpellMultiplier > 0 }
  ];

  const mode = DAMAGE_INNER_MODES.find(m => m.id === curInnerMode) || DAMAGE_INNER_MODES[DAMAGE_INNER_MODES.length - 1];
  const inner = mode.mult;
  const innerOk = inner > 0;

  let bad = false;
  checks.forEach(c => {
    c.el.style.borderColor = c.ok ? "" : "var(--nightmare)";
    if (!c.ok) bad = true;
  });

  const breakdownBody = $("dmgBreakdown");

  if (bad || !innerOk) {
    showDamageResult(
      curSpellMultiplier == null
        ? "Pick a dungeon and spell above to calculate damage"
        : "Fill in every field with 0 or more",
      true
    );
    $("dmgSub").textContent = "";
    ["dmgBase", "dmgInner", "dmgFinal", "dmgWeaponEcho", "dmgArmorEcho", "dmgHelmetEcho", "dmgSkillEcho", "dmgSpellEcho"]
      .forEach(id => { const e = $(id); if (e) e.textContent = "—"; });
    $("dmgCompareNone").textContent = "—";
    $("dmgCompareWithout").textContent = "—";
    $("dmgCompareWith").textContent = "—";
    $("dmgCompareDiff").textContent = "";
    if (breakdownBody) breakdownBody.innerHTML = "";
    return;
  }

  const spell = curSpellMultiplier;
  const base = calculateBaseDamage(weapon, armor, helmet, skill, spell);
  const final = calculateFinalDamage(base, inner);

  showDamageResult(formatDamageCompact(final), false);
  $("dmgSub").textContent = `${mode.name} · skill ${skill.toLocaleString()} · spell ${spell.toLocaleString()}x`;
  $("dmgBase").textContent = formatDamageCompact(base);
  $("dmgInner").textContent = inner.toFixed(2) + "x";
  $("dmgFinal").textContent = formatDamageCompact(final);
  $("dmgWeaponEcho").textContent = compact(weapon);
  $("dmgArmorEcho").textContent = compact(armor);
  $("dmgHelmetEcho").textContent = compact(helmet);
  $("dmgSkillEcho").textContent = skill.toLocaleString();
  $("dmgSpellEcho").textContent = spell.toLocaleString() + "x";

  const noneMode = DAMAGE_INNER_MODES.find(m => m.id === "none");
  const withMode = DAMAGE_INNER_MODES.find(m => m.id === "with");
  const enhancedMode = DAMAGE_INNER_MODES.find(m => m.id === "enhanced");
  const noneDamage = calculateFinalDamage(base, noneMode ? noneMode.mult : 1.0);
  const withoutDamage = calculateFinalDamage(base, withMode ? withMode.mult : 1.8);
  const withDamage = calculateFinalDamage(base, enhancedMode ? enhancedMode.mult : 1.9);
  const diff = withDamage - noneDamage;
  const pct = noneDamage > 0 ? (diff / noneDamage) * 100 : 0;
  $("dmgCompareNone").textContent = formatDamageCompact(noneDamage);
  $("dmgCompareWithout").textContent = formatDamageCompact(withoutDamage);
  $("dmgCompareWith").textContent = formatDamageCompact(withDamage);
  $("dmgCompareDiff").textContent = `Without Inner → With Enhanced Inner: ${formatDamageCompact(diff)} more · +${pct.toFixed(2)}%`;

  if (breakdownBody) {
    const skillFactor = 0.6597 + 0.013202 * skill;
    const armorHelmetSum = armor + helmet;
    const armorFactor = armorHelmetSum * 0.0028;
    breakdownBody.innerHTML = `
      <h4>Skill factor</h4>
      <div class="brow"><span>0.6597 + (0.013202 × ${skill.toLocaleString()})</span><span>${formatExact(skillFactor)}</span></div>
      <h4>Armor + helmet</h4>
      <div class="brow"><span>${armor.toLocaleString()} + ${helmet.toLocaleString()}</span><span>${formatExact(armorHelmetSum)}</span></div>
      <h4>Armor/helmet factor</h4>
      <div class="brow"><span>${armorHelmetSum.toLocaleString()} × 0.0028</span><span>${formatExact(armorFactor)}</span></div>
      <h4>Base damage</h4>
      <div class="brow"><span>${weapon.toLocaleString()} × ${formatExact(skillFactor)} × ${formatExact(armorFactor)} × ${spell.toLocaleString()}</span><span>${formatDamageCompact(base)}</span></div>
      <div class="brow"><span style="opacity:.65">exact</span><span>${formatExact(base)}</span></div>
      <h4>Inner</h4>
      <div class="brow total"><span>${formatDamageCompact(base)} × ${inner.toFixed(2)}</span><span>${formatDamageCompact(final)}</span></div>
      <div class="brow"><span style="opacity:.65">exact</span><span>${formatExact(final)}</span></div>
    `;
  }

  store.set(KEY_DAMAGE, JSON.stringify({
    weapon, armor, helmet, skill,
    spellDungeonIndex: curSpellDungeonIndex, spellKey: curSpellKey, spellMultiplier: curSpellMultiplier,
    inner: curInnerMode
  }));
}

["dmgWeapon", "dmgArmor", "dmgHelmet", "dmgSkill"].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener("input", calculateDamage);
});

const dmgResetBtn = $("dmgReset");
if (dmgResetBtn) dmgResetBtn.addEventListener("click", () => {
  $("dmgWeapon").value = DAMAGE_DEFAULTS.weapon;
  $("dmgArmor").value = DAMAGE_DEFAULTS.armor;
  $("dmgHelmet").value = DAMAGE_DEFAULTS.helmet;
  $("dmgSkill").value = DAMAGE_DEFAULTS.skill;
  curInnerMode = DAMAGE_DEFAULTS.inner;
  [...$("dmgInnerModes").children].forEach(x => x.setAttribute("aria-pressed", String(x.dataset.mode === curInnerMode)));
  if (window.__dmgApplyDefaultPick) window.__dmgApplyDefaultPick();
  calculateDamage();
});

const dmgToggle = $("dmgBreakdownToggle");
if (dmgToggle) dmgToggle.addEventListener("click", () => {
  const body = $("dmgBreakdown");
  const open = !body.classList.contains("on");
  body.classList.toggle("on", open);
  dmgToggle.setAttribute("aria-expanded", String(open));
  dmgToggle.textContent = open ? "Formula breakdown ▴" : "Formula breakdown ▾";
});

(function restoreDamage() {
  if (!$("dmgWeapon")) return;
  let s = null;
  try { s = JSON.parse(store.get(KEY_DAMAGE) || "null"); } catch (e) {}
  if (s) {
    if (s.weapon != null) $("dmgWeapon").value = s.weapon;
    if (s.armor != null) $("dmgArmor").value = s.armor;
    if (s.helmet != null) $("dmgHelmet").value = s.helmet;
    if (s.skill != null) $("dmgSkill").value = s.skill;
    if (s.inner && DAMAGE_INNER_MODES.some(m => m.id === s.inner)) {
      curInnerMode = s.inner;
      [...$("dmgInnerModes").children].forEach(x => x.setAttribute("aria-pressed", String(x.dataset.mode === s.inner)));
    }
    const dungeonSel = $("dmgSpellDungeon");
    const d = dungeonSel && s.spellDungeonIndex !== "" && s.spellDungeonIndex != null
      ? DAMAGE_SPELL_DUNGEONS[+s.spellDungeonIndex] : null;
    if (d && s.spellKey) {
      const [group, idx] = String(s.spellKey).split(":");
      const list = group === "Warrior" ? d.warrior : d.mage;
      const spell = list && list[+idx];
      if (spell) {
        dungeonSel.value = String(s.spellDungeonIndex);
        curSpellDungeonIndex = String(s.spellDungeonIndex);
        if (window.__dmgRebuildSpells) window.__dmgRebuildSpells();
        $("dmgSpellPick").value = s.spellKey;
        curSpellKey = s.spellKey;
        curSpellMultiplier = spell.mult;
        curSpellNote = spell.note || null;
        if (window.__dmgUpdateMultEcho) window.__dmgUpdateMultEcho();
        if (window.__dmgUpdateSpellNote) window.__dmgUpdateSpellNote();
      }
    }
  }
  calculateDamage();
})();
