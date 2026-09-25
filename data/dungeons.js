const BOSS_RAID = {
  levelReq: 130,
  tier: "Tier 30 only",
  xpCapLevel: 145,
  xp: 230000000,
  tierNote: "Tiers 1–30 give the same EXP — confirmed by the in-game EXP Earnings panel. Higher tiers give better loot, not more EXP.",
  excludeBoosts: ["hc"],
  source: "Orange, DQR's administrator"
};

let DUNGEONS = [
  { name:"Desert Temple",  abbr:"DT", runs:{ Easy:506, Medium:792, Hard:1570, Insane:2614, Nightmare:5338 } },
  { name:"Winter Outpost", abbr:"WO", runs:{ Easy:16680, Medium:22600, Hard:32280, Insane:55680, Nightmare:92360 } },
  { name:"Pirate Island",      abbr:"PI", runs:{ Insane:102300, Nightmare:169820 } },
  { name:"King's Castle",      abbr:"KC", runs:{ Insane:271800, Nightmare:543600 } },
  { name:"The Underworld",     abbr:"UW", runs:{ Insane:1092000, Nightmare:1848000 } },
  { name:"Samurai Palace",     abbr:"SP", runs:{ Insane:3448000, Nightmare:4560000 } },
  { name:"The Canals",         abbr:"TC", runs:{ Insane:9188000, Nightmare:16010000 } },
  { name:"Ghastly Harbor",     abbr:"GH", runs:{ Insane:25680000, Nightmare:48320000 } },
  { name:"Steampunk Sewers",   abbr:"SS", runs:{ Insane:71400000, Nightmare:119200000 } },
  { name:"Boss Raid (Lvl 130)", abbr:"BR", pending:BOSS_RAID.pending, excludeBoosts:BOSS_RAID.excludeBoosts, runs:{ "Tier 30":BOSS_RAID.xp } },
  { name:"Orbital Outpost",    abbr:"OO", runs:{ Insane:666000000, Nightmare:960000000 } },
  { name:"Volcanic Chambers",  abbr:"VC", runs:{ Insane:2260000000, Nightmare:3687000000 } },
  { name:"Aquatic Temple",     abbr:"AT", runs:{ Insane:6108000000, Nightmare:10692000000 } },
  { name:"Enchanted Forest",   abbr:"EF", runs:{ Insane:20700000000, Nightmare:33840000000 } },
  { name:"Northern Lands",     abbr:"NL",
                                runs:{ Insane:19154000000, Nightmare:38100000000, "Nightmare + Rodin":60100000000 } }, // rodin alone gives 28.6B
  { name:"Gilded Skies",       abbr:"GS", runs:{ Insane:63500000000, Nightmare:115500000000 } }, // waiting for gs to come out, will change later
  { name:"Yokai Peak",         abbr:"YP", runs:{ Insane:192650000000, Nightmare:350950000000 } }, // ehh idk about this one but ill add it just in case
  { name:"Abyssal Void",       abbr:"AV", runs:{ Insane:1070000000000, Nightmare: 1470000000000} } // This follows the old dq wiki page value, but i will update once new values are released
// Dungeons from GS To AV are not confirmed yet, they follow the old dq wiki page values, but i will update once new values are released.
];
// I will constantly keep looking at my spreadsheet if there are any updates, and i will update it here.
const DUNGEON_ABBR = {
  DT:"Desert Temple", WO:"Winter Outpost", PI:"Pirate Island", KC:"King's Castle",
  UW:"The Underworld", SP:"Samurai Palace", TC:"The Canals", GH:"Ghastly Harbor",
  SS:"Steampunk Sewers", BR:"Boss Raid", OO:"Orbital Outpost", VC:"Volcanic Chambers",
  AT:"Aquatic Temple", EF:"Enchanted Forest", NL:"Northern Lands", GS:"Gilded Skies",
  YP:"Yokai Peak", AV:"Abyssal Void"
};
