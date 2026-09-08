# DQR Toolkit

A site for Dungeon Quest Reborn: a dungeon run calculator, a database of every dungeon's
base EXP value (including Boss Raid), farming/gamepass rates, and a pot calculator —
organised as five sections behind one floating nav bar (Calculator, Dungeons, Farming,
Pots, About).
No build step, no framework, no server — just static files, split into folders instead of
one giant `index.html`.

## Where things live

```
index.html              the shell: markup, plus the <script>/<link> tags that load everything else
styles/
  main.css                the design system: tokens, reset, glass header/result styles,
                          plate/table/form styles, the run calculator (readout, tiers,
                          boost pills), the database tables, badges, About/footer
js/
  utils.js                $ helper, localStorage wrapper, colour + number formatting
  tabs.js                   the five-section nav switcher (Calculator/Dungeons/Farming/Pots/About)
  dungeons-table.js          All Dungeons EXP table (with search + sortable columns) + Boss Raid panel + live sheet sync
  prices-table.js            Farming & gamepass prices table (search + sortable columns) + its live sheet sync
  calculator.js               the run calculator itself
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

The scripts load in that order (data → utils → the three feature files → calculator → main),
because later files use functions and data the earlier ones define. If you add a new script,
slot it in where it belongs in that chain rather than at the very top or bottom.

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
