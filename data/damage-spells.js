const DAMAGE_SPELL_DUNGEONS = [
  {
    abbr: "PI", name: "Pirate Island",
    warrior: [
      { name: "Demonic Strike", mult: 8.25, difficulty: "Insane", note: "buffed from 5.6x" },
      { name: "Enchanted Spinning Blades", mult: 29.4, tick: 2.45, note: "buffed from 21x" }
    ],
    mage: [
      { name: "Ghostly Cannon Barrage", mult: 27.6, tick: 2.3, difficulty: "Insane" },
      { name: "Pulse Fire", mult: 27.2, tick: 1.7 },
      { name: "Phantom Flames", mult: 29.2, tick: 3.65 }
    ]
  },
  {
    abbr: "KC", name: "King's Castle",
    warrior: [
      { name: "Glacial Blows", mult: 16.8, tick: 4.2, difficulty: "Insane" },
      { name: "Blade Throw", mult: 14.26, tick: 7.13, difficulty: "Nightmare", note: "buffed from 12.4x" }
    ],
    mage: [
      { name: "Void Beam", mult: 32.09, tick: 5.35, difficulty: "Nightmare", note: "buffed from 27.9x" },
      { name: "Electric Boom", mult: 30.6, tick: 5.1, difficulty: "Nightmare", note: "buffed from 25.5x" },
      { name: "Thunderous Blast", mult: 10.8, difficulty: "Insane", note: "buffed from 9x" }
    ]
  },
  {
    abbr: "UW", name: "The Underworld",
    warrior: [
      { name: "Rending Slice", mult: 22.5, difficulty: "Nightmare", note: "buffed from 19.6x" },
      { name: "Infernal Strike", mult: 23.52, difficulty: "Nightmare", note: "7 ticks: 5.88x first, 2.94x each after (buffed from 19.6x)" }
    ],
    mage: [
      { name: "Infernal Orbs", mult: 29.04, tick: 2.42, difficulty: "Insane", note: "buffed from 26.4x" },
      { name: "Demonic Spikes", mult: 29.83, tick: 2.49, difficulty: "Insane", note: "buffed from 27.12x" },
      { name: "Ice Totem", mult: 32.55, tick: 3.26, difficulty: "Nightmare", note: "buffed from 31x" },
      { name: "Ice Nova", mult: 27, tick: 2.25, difficulty: "Nightmare" }
    ]
  },
  {
    abbr: "SP", name: "Samurai Palace",
    warrior: [
      { name: "Flame Cyclone", mult: 49, tick: 3.27, note: "buffed from 39x" },
      { name: "Berserk", mult: 34.32, tick: 3.12, note: "buffed from 28.6x" },
      { name: "Lava Lash", mult: 17.4, tick: 8.7, difficulty: "Insane" }
    ],
    mage: [
      { name: "Hand Cannon", mult: 20.4, difficulty: "Insane", note: "buffed from 12x" },
      { name: "Earth Clap", mult: 21, difficulty: "Insane" },
      { name: "Enchanted Shuriken", mult: 26, tick: 13, difficulty: "Insane" },
      { name: "Ghostly Rampage", mult: 35.19, tick: 5.87, difficulty: "Nightmare", note: "buffed from 30.6x" },
      { name: "Illusion Blast", mult: 38, tick: 9.5, difficulty: "Nightmare" }
    ]
  },
  {
    abbr: "TC", name: "The Canals",
    warrior: [
      { name: "Runic Strike", mult: 18.5 },
      { name: "Electric Slash", mult: 38.4 },
      { name: "Blade Revolver", mult: 34.2, tick: 5.7 },
      { name: "Blade Storm", mult: 46.8, tick: 3.9 }
    ],
    mage: [
      { name: "Earth Kick", mult: 22 },
      { name: "Tsunami", mult: 29.5 },
      { name: "Icicle Barrage", mult: 33, tick: 16.5 },
      { name: "Forgotten Army", mult: 32.8, tick: 4.1 },
      { name: "Vortex", mult: 41.5, tick: 4.15 }
    ]
  },
  {
    abbr: "GH", name: "Ghastly Harbor",
    warrior: [
      { name: "Mighty Leap", mult: 24.7 },
      { name: "Pulse Beam", mult: 33, tick: 16.5 },
      { name: "Phantom Blades", mult: 34.8, tick: 5.8 },
      { name: "Earth Spikes", mult: 32, difficulty: "Insane" }
    ],
    mage: [
      { name: "Spirit Bomb", mult: 38 },
      { name: "Smite", mult: 25 },
      { name: "Void Spheres", mult: 43, tick: 4.3 },
      { name: "Phantom Striker", mult: 40.8, tick: 6.8 }
    ]
  },
  {
    abbr: "SS", name: "Steampunk Sewers",
    warrior: [
      { name: "Arrow Rain", mult: 35, tick: 3.5 },
      { name: "Star Barrage", mult: 44.4, tick: 7.4 },
      { name: "Triple Blade Throw", mult: 42, tick: 21 },
      { name: "Chained Energy Blasts", mult: 60, tick: 15 }
    ],
    mage: [
      { name: "Starfall", mult: 38 },
      { name: "Pulse Waves", mult: 33, tick: 5.5 },
      { name: "Overcharge", mult: 44.25 },
      { name: "Chromatic Rain", mult: 54.9, tick: 6.1 }
    ]
  },
  {
    abbr: "BR", name: "Boss Raid",
    warrior: [
      { name: "Explosive Punch", mult: 37 },
      { name: "Electric Grinder", mult: 42, tick: 10.5 },
      { name: "Arrow Barrage", mult: 38 },
      { name: "Ground Stomp", mult: 37 },
      { name: "Twin Slash", mult: 27, tick: 13.5 }
    ],
    mage: [
      { name: "Orb of Destruction", mult: 51, tick: 8.5 },
      { name: "Chain Lightning", mult: 38 },
      { name: "Infernal Blast", mult: 43.5 },
      { name: "Demonic Curse", mult: 46, tick: 4.6 },
      { name: "Molten Ball", mult: 40, tick: 20 }
    ]
  },
  {
    abbr: "OO", name: "Orbital Outpost",
    warrior: [
      { name: "Focus Beam", mult: 47 },
      { name: "Vortex Grenade", mult: 80, tick: 16 },
      { name: "Explosive Mine", mult: 48 }
    ],
    mage: [
      { name: "Mystery Matter", mult: 61.35, tick: 20.45 },
      { name: "Electric Field", mult: 66.8, tick: 16.7 },
      { name: "Energy Orb", mult: 65 }
    ]
  },
  {
    abbr: "VC", name: "Volcanic Chambers",
    warrior: [
      { name: "Molten Shards", mult: 75 },
      { name: "Blade Fall", mult: 82 },
      { name: "Lava Barrage", mult: 83.2, tick: 20.8 }
    ],
    mage: [
      { name: "Lava Beam Orb", mult: 75 },
      { name: "Lava Cage", mult: 84, tick: 16.8 },
      { name: "Amethyst Blast", mult: 82, difficulty: "Nightmare" }
    ]
  },
  {
    abbr: "AT", name: "Aquatic Temple",
    warrior: [
      { name: "Spear Strike", mult: 86 },
      { name: "Ice Barrage", mult: 94.27, note: "buffed from 92x" },
      { name: "Ice Crash", mult: 92 }
    ],
    mage: [
      { name: "Water Orb", mult: 86 },
      { name: "Ice Spikes", mult: 94.27, note: "buffed from 92x" },
      { name: "Aquatic Smite", mult: 92 }
    ]
  },
  {
    abbr: "EF", name: "Enchanted Forest",
    warrior: [
      { name: "Piercing Roots", mult: 100 },
      { name: "Crystalline Cannon", mult: 110.21, note: "buffed +3% from 107x" },
      { name: "Wind Blast", mult: 107 }
    ],
    mage: [
      { name: "Fungal Poison", mult: 100.2, tick: 16.7 },
      { name: "Agony Orbs", mult: 107 },
      { name: "Lightning Burst", mult: 107 }
    ]
  },
  {
    abbr: "NL", name: "Northern Lands",
    warrior: [
      { name: "Frost Cone", mult: 112, difficulty: "Insane" },
      { name: "Gale Barrage", mult: 122.57, tick: 40.86, difficulty: "Nightmare", note: "Warrior, scales with Physical Power. Fires wind bursts over 3 ticks (~40.86x each) for ~122.57x total per cast. Drops from Northern Lands on Nightmare, req level 185, sells ~110M gold. Officially corrected by the game owner, up from 119x." },
      { name: "Flame Shuriken", mult: 119, difficulty: "Nightmare" }
    ],
    mage: [
      { name: "Flame Strike", mult: 112 },
      { name: "Geyser", mult: 119, difficulty: "Nightmare" },
      { name: "Soul Drain", mult: 122.57, tick: 20.43, difficulty: "Nightmare", note: "Mage, scales with Spell Power. Conjures a draining circle that hits everything inside over 6 ticks (~20.43x each) for ~122.57x total per cast. Officially corrected by the game owner, up from 118.98x." }
    ]
  }
];
