# DQR Toolkit

A one-page site for Dungeon Quest Reborn: a checklist and a dungeon EXP calculator.
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

**Add or change a dungeon:** add a line to `DUNGEONS`. Base EXP is the value *before* any boost. This is the only place run EXP is set — there is no input for it on the page.

```js
{ name:"New Dungeon", runs:{ Insane:1000000, Nightmare:2000000 } },
```

**Add or change a boost:** add a line to `BOOSTS`. `add: 0.5` means +50%.

```js
{ id:"myboost", name:"Some new event", add:0.50 },
```

**Change the level curve:** the `xpForLevel` line. It's 84 EXP for level 1, rising 13% each level.

## How the maths works

- Boosts add together on top of 1. VIP (+0.2) with an EXP potion (+1.0) and a 2x event (+1.0) is **3.2x**, not 4.4x.
- Friends give +3% each up to +30%.
- Total EXP needed = the sum of every level's requirement from your level up to the target, minus your Current EXP.
- Current EXP accepts shorthand: `1K`, `2.5M`, `1B`, `1T`.
- Runs are rounded up.

## Where your data lives

The checklist and your last calculator settings are stored in the browser's local storage
on the device you're using. Nothing is sent anywhere. A different phone or browser starts
empty — use **Export backup** / **Restore backup** to move the list across.

## Source

EXP tables and the level curve come from the Dungeon Quest wiki:
https://dungeonquestroblox.fandom.com/wiki/Levels

Reborn is a separate community project and its numbers may drift from official DQ. If a
dungeon's run count looks wrong, correct its value in the `DUNGEONS` block.

Made by Harry 75%, Claude AI 25%. Fan project, not affiliated with Roblox.
