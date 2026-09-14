# DQR Toolkit

A site for Dungeon Quest Reborn: a dungeon run calculator, a database of every dungeon's
base EXP value (including Boss Raid), farming/gamepass rates, and a pot calculator that
also works out upgrade gold cost — organised as five sections behind one floating nav bar
(Runs, Pots, Dungeon EXP, Gamepasses, About). The tabs used to be labelled Calculator/Pots/
Dungeons/Farming — renamed for clarity, nothing about the underlying views changed.
No build step, no framework, no server — just static files, split into folders instead of
one giant `index.html`.

## Where things live

```
index.html              the shell: markup, plus the <script>/<link> tags that load everything else
styles/
  main.css                the design system: tokens, reset, glass header/result styles,
                          plate/form styles, the run calculator (readout, tiers, boost pills),
                          the pot calculator's upgrade progress bar + screenshot scanner,
                          the database tables, badges, About/footer
js/
  utils.js                $ helper, localStorage wrapper, colour + number formatting
  tabs.js                   the five-section nav switcher (Runs/Pots/Dungeon EXP/Gamepasses/About)
  dungeons-table.js          Dungeon EXP table (with search + sortable columns) + Boss Raid panel + live sheet sync
  prices-table.js            Gamepasses table (search + sortable columns) + its live sheet sync
  calculator.js               the run calculator itself
  pot-calculator.js          the pot calculator (gear mode + dungeon mode), the upgrade gold
                              cost calculator, and the upgrade-progress bar — all sharing the
                              same Current pot / Already upgraded / Upgrades needed fields
  pot-scan.js                 the screenshot scanner on the Pots tab: OCRs an uploaded item
                              card client-side (Tesseract.js) and offers to fill in those
                              same three fields for you — see "Scanning a screenshot" below
  main.js                      kicks off the live EXP fetch once everything above is ready
data/
  dungeons.js               BOSS_RAID + DUNGEONS — the numbers you edit by hand
  boosts.js                  BOOSTS, TIER_COLOUR, the level-up XP curve
  price-snapshot.js           fallback prices table, used if the live sheet can't be reached
images/
  favicon-32.svg              tab icon — svg first, browsers that don't support it fall back to the png
  favicon-32.png                 same icon, png fallback
  apple-touch-icon-180.png         iOS home-screen icon — has to stay png, iOS won't take svg here
  apple-touch-icon-180.svg          same icon as svg, kept for anywhere else that can use it
```

The scripts load in that order (data → utils → the three feature files → calculator →
pot-calculator → pot-scan → main), because later files use functions and data the earlier
ones define. If you add a new script, slot it in where it belongs in that chain rather than
at the very top or bottom.

## Scanning a screenshot (Pots tab)

Instead of typing Current pot / Already upgraded / Upgrades needed by hand, you can upload
(click, drag-drop, or paste with Ctrl+V) a screenshot of one item's stat card — the tooltip
that shows Physical power, Spell Power, Health, REQ Lvl, Upgrades and Sell.

`js/pot-scan.js` runs that image through [Tesseract.js](https://github.com/naptha/tesseract.js)
entirely in the browser (loaded from jsDelivr in `index.html`) — the screenshot is never
uploaded anywhere, same as everything else on this site. It reads off Physical power, Spell
Power, Health, and the Upgrades `done/total` line, then guesses which of the three stats is
this item's "main pot" from a class keyword anywhere in the card's text:

```js
const POT_SCAN_CLASS_MAP = [
  { pattern:/guardian/i,  stat:"health" },
  { pattern:/warrior/i,   stat:"physical" },
  { pattern:/mage/i,      stat:"spell" },
  // ...
];
```

If nothing matches, it falls back to whichever of Physical/Spell power looks dominant. Either
way, you get a chance to confirm (or override) the guess with three stat buttons before
anything is filled in — OCR on small game UI text won't always be perfect, so nothing gets
applied to the real fields until you hit **Calculate pot**. Add a line to
`POT_SCAN_CLASS_MAP` if a new item line uses a class name this doesn't recognise yet.

To make small pixel-font text easier to read, it runs the image through a canvas upscale +
contrast pass before OCR, then always takes a second, unprocessed pass and merges the two —
one pass alone regularly misses one field even when it finds the rest, so this doesn't try to
guess when to skip the second pass.

## Put it online (GitHub Pages)

1. Make a new repository on github.com. Public. Don't add a README (this one is already here).
2. Upload the whole folder — `index.html`, this file, and the `styles/`, `js/`, `data/` and
   `images/` folders — to the root of the repo, keeping the folder structure intact.
3. Repo → **Settings** → **Pages**.
4. Under *Build and deployment*, set Source = **Deploy from a branch**, Branch = **main**, folder = **/ (root)**. Save.
5. Wait a minute, then reload the Pages settings page. Your link appears at the top:
   `https://YOUR-USERNAME.github.io/YOUR-REPO/`

The site's entry point must stay named `index.html` at the repo root, or Pages will show a 404.

## Visitor tracking

A Cloudflare Web Analytics snippet sits right before `</body>` in `index.html`. It's free,
doesn't use cookies, and doesn't collect anything personal — just page views and visit counts,
viewable at dash.cloudflare.com under Web Analytics for the `suzuki1130.github.io` hostname.
Don't remove or edit that `<script>` tag unless you're intentionally turning tracking off.

## Editing the data

Everything the calculator uses lives in `data/dungeons.js` and `data/boosts.js`.

**Add or change a dungeon:** add a line to `DUNGEONS` in `data/dungeons.js`. Base EXP is the
value *before* any boost. This is the only place run EXP is set — there is no input for it on
the page.

```js
{ name:"New Dungeon", runs:{ Insane:1000000, Nightmare:2000000 } },
```

**Missing EXP values:** Desert Temple and Winter Outpost are the only two dungeons with all
five difficulties — every other dungeon stops at Hard, so it only has Insane and Nightmare
filled in. The page shows a blank column as `—` until a real number replaces it.

**Flag a dungeon as being re-checked:** add `pending:true` to its entry and it gets an orange
*checking* badge next to its name on the All Dungeons EXP tab. Drop the flag once the numbers
for that dungeon are confirmed.

```js
{ name:"New Dungeon", pending:true, runs:{ Insane:1000000, Nightmare:2000000 } },
```

**Flag a dungeon with a heads-up note:** add a `note:"..."` string to its entry and it gets a
red *watch* badge plus a warning box under the table with the note's text.

```js
{ name:"New Dungeon", note:"Why this one might change soon.", runs:{ Insane:1000000, Nightmare:2000000 } },
```

**Add or change a boost:** add a line to `BOOSTS` in `data/boosts.js`. `add: 0.5` means +50%.
Boosts that share a `group` can't be picked at the same time, which is how the two events
behave. Solo and HC (Hardcore) are each `add: 0.10` — a flat +10%, same shape as VIP's +20%.

```js
{ id:"myboost", name:"Some new event", add:0.50 },
```

**Difficulty colours:** each difficulty name is coloured from `TIER_COLOUR` in `data/boosts.js`,
and the whole page takes its accent from whichever one is selected. A name that isn't in the
list falls back to blue.

**Change the level curve:** the `xpForLevel` line in `data/boosts.js`. It's 84 EXP for level 1,
rising 13% each level — `84 × 1.13^(lvl−1)`.

**Boss raid info:** raids run on a different tier ladder than dungeon difficulties, but the raid
shows up in `DUNGEONS` as its own row too (a "Boss Raid (Lvl 130)" entry with a single "Tier 30"
column) — the row reads its EXP from `BOSS_RAID.xp`, so editing `BOSS_RAID` updates both the
table row and the extra info panel below it at once. `BOSS_RAID` is declared *above* `DUNGEONS`
in `data/dungeons.js` since the row references it — keep it there, or the row will throw a
"can't access before initialization" error. Set `xp` to `null` if a value ever needs pulling
back out (the panel and the table row both show *no XP yet* while it's `null`).

```js
const BOSS_RAID = {
  levelReq: 130,
  tier: "Tier 30 only",
  xpCapLevel: 145,
  xp: 130000000,
  tierNote: "...",
  excludeBoosts: ["hc"],
  source: "Orange, DQR's administrator"
};
```

**Locking a boost out for a specific dungeon:** add `excludeBoosts:["id", ...]` (boost ids from
`BOOSTS`) to any `DUNGEONS` entry and the Run Calculator greys out and locks off that boost's
pill whenever that dungeon is selected — it can't be toggled on, and switching away un-greys it
again. Boss Raid uses this for `hc`, since it has no Hardcore mode (per the old wiki's Boss Raid
(Legacy) page — the in-game name stays "Boss Raid", no "(Legacy)" tag).

## How the live spreadsheet sync works

`js/dungeons-table.js` reads the EXP spreadsheet and rebuilds `DUNGEONS` from it once it loads,
and `js/prices-table.js` does the same for the prices sheet — see `data/price-snapshot.js` for
the fallback shown if either fetch fails. A sheet column header only gets picked up if
`normaliseColumnKey()` in `js/dungeons-table.js` recognises it (`T1~T30` → `Tier 30`, anything
with "nightmare" and "odin"/"rodin" in it → `Nightmare + Rodin`) — add another line there if the
sheet ever gets a new column that needs mapping to a name the page already knows.

When a live row updates a dungeon that's already hardcoded in `data/dungeons.js`, its columns
are merged on top of the hardcoded ones rather than replacing them outright — so a column that's
still blank on the sheet (like Northern Lands' "Nightmare + Rodin" while that number's still
unconfirmed) keeps showing the value from `data/dungeons.js` instead of the whole column
disappearing.

## How the upgrade gold cost formula works

The gold cost calculator lives inside `js/pot-calculator.js`, in the Pots tab — it reuses
the same "Upgrades needed" (target) and "Already upgraded" (current) fields as the pot
result, and shows the gold cost for that same range underneath the pot result. The formula
was reverse-engineered from live in-game upgrade prices and cross-checked against Dungeon
Bot's `calc-pot` totals (exact match on every real item tested so far):

- Upgrades 0–23: a fixed table (`GOLD_RAMP`) read off the live upgrade panel. A few of
  those steps (7–9, 11–19) were never logged individually, so they're interpolated — but
  the table's total across all 24 steps is pinned to exactly 27,415 gold, solved for by
  matching two real full-upgrade totals from Dungeon Bot, so only the *split* between
  those few unlogged steps carries any slack (at most a couple hundred gold).
- Upgrades 24–465: `cost(n) = 220n − 2335` gold, confirmed exact.
- Upgrade 466 onward: a flat 100,000 gold per upgrade, confirmed exact — this is also the
  466-upgrade cap the old Dungeon Quest wiki describes.

Since almost every real item has thousands of upgrades, the 466+ flat-rate stretch
dominates the total. The closed form for a full upgrade from 0 to `M` (for `M ≥ 466`,
true of virtually every item) is `100,000 × M − 23,829,475` gold exactly.

If you log exact costs for the still-unconfirmed upgrades (7, 8, 9, 11–19) from the live
upgrade panel, update `GOLD_RAMP` in `js/pot-calculator.js` — the array is cost(n) for
n = 0 to 23, in order — and the small remaining slack goes away entirely.

## How the maths works

- Boosts add together on top of 1. VIP (+0.2) with Solo (+0.1), HC (+0.1) and an EXP Boost
  (+1.0) is **2.4x**, not something you'd get by multiplying them together.
- Total EXP needed = the sum of every level's requirement from your level up to the target,
  minus the EXP you already have.
- Current EXP accepts shorthand: `1K`, `2.5M`, `1B`, `1T`.
- Runs are rounded up.
- Every difficulty of the selected dungeon shows its own run count, so you can see what
  dropping down a tier costs you.
- To work out a raw base EXP value from a boosted run by hand: divide what you gained by the
  multiplier that was active (e.g. VIP + Solo + HC active = divide by 1.4).

There is no party-size bonus in the multiplier sense — EXP isn't split between party members,
everyone gets the full amount.

## Where your data lives

Your last calculator settings are stored in the browser's local storage on the device you're
using. Nothing is sent anywhere. The All Dungeons EXP table is read straight from the
`DUNGEONS` data, nothing about it is saved.

## Source

EXP values for the dungeons before Orbital Outpost are learned from the old Dungeon Quest wiki:
https://dungeonquestroblox.fandom.com/wiki/Levels

Orbital Outpost through Enchanted Forest were checked in-game running Solo + HC + VIP and
dividing the multiplier back out. Reborn is a separate community project and its numbers may
drift from official DQ. If a dungeon's run count looks wrong, correct its value in
`data/dungeons.js`.

Made by Harry. Contributor: FriedByFluoriide — checked the EXP values from Orbital Outpost to
Enchanted Forest. Fan project, not affiliated with Roblox.

README WAS MADE BY CLAUDE AI, I DO NOT WANT TO TAKE FULL CREDIT HERE
