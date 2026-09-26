const BOSS_RAID = {
  levelReq: 130,
  tier: "Tier 30 only",
  xpCapLevel: 145,
  xp: 130000000,
  tierNote: "Tiers 1–30 give the same EXP — confirmed by the in-game EXP Earnings panel. Higher tiers give better loot, not more EXP.",
  excludeBoosts: ["hc"],
  source: "Orange, DQR's administrator"
};

let DUNGEONS = [
  { name:"Desert Temple",  abbr:"DT", runs:{ Easy:253, Medium:396, Hard:785, Insane:1307, Nightmare:2669 } },
  { name:"Winter Outpost", abbr:"WO", runs:{ Easy:8340, Medium:11300, Hard:16140, Insane:27840, Nightmare:46180 } },
  { name:"Pirate Island",      abbr:"PI", runs:{ Insane:51150, Nightmare:84910 } },
  { name:"King's Castle",      abbr:"KC", runs:{ Insane:135900, Nightmare:271800 } },
  { name:"The Underworld",     abbr:"UW", runs:{ Insane:546000, Nightmare:924000 } },
  { name:"Samurai Palace",     abbr:"SP", runs:{ Insane:1724000, Nightmare:2280000 } },
  { name:"The Canals",         abbr:"TC", runs:{ Insane:4594000, Nightmare:8005000 } },
  { name:"Ghastly Harbor",     abbr:"GH", runs:{ Insane:12840000, Nightmare:24160000 } },
  { name:"Steampunk Sewers",   abbr:"SS", runs:{ Insane:35700000, Nightmare:59600000 } },
  { name:"Boss Raid (Lvl 130)", abbr:"BR", pending:BOSS_RAID.pending, excludeBoosts:BOSS_RAID.excludeBoosts, runs:{ "Tier 30":BOSS_RAID.xp } },
  { name:"Orbital Outpost",    abbr:"OO", runs:{ Insane:333000000, Nightmare:480000000 } },
  { name:"Volcanic Chambers",  abbr:"VC", runs:{ Insane:1130000000, Nightmare:1843500000 } },
  { name:"Aquatic Temple",     abbr:"AT", runs:{ Insane:3054000000, Nightmare:5346000000 } },
  { name:"Enchanted Forest",   abbr:"EF", runs:{ Insane:10350000000, Nightmare:16920000000 } },
  { name:"Northern Lands",     abbr:"NL",
                                runs:{ Insane:19154000000, Nightmare:38100000000, "Nightmare + Rodin":60100000000 } }, // rodin alone gives 28.6B
  { name:"Gilded Skies",       abbr:"GS",
                                runs:{ Insane:"To be recorded", Nightmare:"To be recorded", "Nightmare + Secret Boss":"To be recorded" } }, // placeholders until GS is out and the EXP is logged
  { name:"New Dungeon",        abbr:"ND", runs:{ Insane:"???", Nightmare:"???" } } // coming soon, name and EXP not known yet
// Yokai Peak and Abyssal Void are not releasing, so they're left out. A text value (like "To be recorded") shows as-is in the table and counts as "no EXP yet" in the calculator.
];
// I will constantly keep looking at my spreadsheet if there are any updates, and i will update it here.
const DUNGEON_ABBR = {
  DT:"Desert Temple", WO:"Winter Outpost", PI:"Pirate Island", KC:"King's Castle",
  UW:"The Underworld", SP:"Samurai Palace", TC:"The Canals", GH:"Ghastly Harbor",
  SS:"Steampunk Sewers", BR:"Boss Raid", OO:"Orbital Outpost", VC:"Volcanic Chambers",
  AT:"Aquatic Temple", EF:"Enchanted Forest", NL:"Northern Lands", GS:"Gilded Skies",
  ND:"New Dungeon", YP:"Yokai Peak", AV:"Abyssal Void"
};
// Dungeons that are still on the spreadsheet but won't be released. The live EXP table skips them.
const NOT_RELEASING = ["YP","AV"];
