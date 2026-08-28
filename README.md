# DQR Toolkit

A one-page site for Dungeon Quest Reborn: a dungeon run calculator and a table of every
dungeon's base EXP value, including Boss Raid.
No build step, no framework, no server — one `index.html` file.

## Put it online (GitHub Pages)

1. Make a new repository on github.com. Public. Don't add a README (this one is already here).
2. Upload `index.html` (and this file) to the root of the repo.
3. Repo → **Settings** → **Pages**.
4. Under *Build and deployment*, set Source = **Deploy from a branch**, Branch = **main**, folder = **/ (root)**. Save.
5. Wait a minute, then reload the Pages settings page. Your link appears at the top:
   `https://YOUR-USERNAME.github.io/YOUR-REPO/`

The file must be named `index.html` exactly, or Pages will show a 404.

## Editing the data

Everything the calculator uses sits in one block near the bottom of `index.html`, under
`DATA — edit these two blocks`.

**Add or change a dungeon:** add a line to `DUNGEONS`. Base EXP is the value *before* any boost.
This is the only place run EXP is set — there is no input for it on the page.

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
red *watch* badge plus a warning box under the table with the note's text. Northern Lands uses
this to flag that its EXP values are likely to change after its Aug 30 re-release.

```js
{ name:"New Dungeon", note:"Why this one might change soon.", runs:{ Insane:1000000, Nightmare:2000000 } },
```

**Add or change a boost:** add a line to `BOOSTS`. `add: 0.5` means +50%. Boosts that share a
`group` can't be picked at the same time, which is how the two events behave. Solo and HC
(Hardcore) are each `add: 0.10` — a flat +10%, same shape as VIP's +20%.

```js
{ id:"myboost", name:"Some new event", add:0.50 },
```

**Difficulty colours:** each difficulty name is coloured from `TIER_COLOUR`, and the whole page
takes its accent from whichever one is selected. A name that isn't in the list falls back to blue.

**Change the level curve:** the `xpForLevel` line. It's 84 EXP for level 1, rising 13% each
level — `84 × 1.13^(lvl−1)`.

**Boss raid info:** raids run on a different tier ladder than dungeon difficulties, but the raid
shows up in `DUNGEONS` as its own row too (a "Boss Raid (Lvl 130)" entry with a single "Tier 30"
column) — the row reads its EXP from `BOSS_RAID.xp`, so editing `BOSS_RAID` updates both the
table row and the extra info panel below it at once. `BOSS_RAID` is declared *above* `DUNGEONS`
in the file since the row references it — keep it there, or the row will throw a
"can't access before initialization" error. Set `xp` to `null` if a value ever needs pulling
back out (the panel and the table row both show *no XP yet* while it's `null`).

```js
const BOSS_RAID = {
  levelReq: 130,
  tier: "Tier 30 only",
  xpCapLevel: 145,
  xp: 130000000,   /* same EXP for every tier, confirmed via the in-game EXP Earnings panel */
  tierNote: "...",
  source: "Orange, DQR's administrator"
};
```

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
drift from official DQ. If a dungeon's run count looks wrong, correct its value in the
`DUNGEONS` block.

Made by Harry. Contributor: FriedByFluoriide — checked the EXP values from Orbital Outpost to
Enchanted Forest. Fan project, not affiliated with Roblox.
