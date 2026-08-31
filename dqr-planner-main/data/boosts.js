const BOOSTS = [
  { id:"vip",      name:"VIP game pass", add:0.20 },
  { id:"solo",     name:"Solo",          add:0.10 },
  { id:"hc",       name:"HC (Hardcore)", add:0.10 },
  { id:"expboost", name:"EXP Boost",     add:1.00 },
  { id:"ev2",      name:"2x EXP event",  add:1.00, group:"event" },
  { id:"ev15",     name:"1.5x EXP event",add:0.50, group:"event" }
];

const xpForLevel = n => Math.round(84 * Math.pow(1.13, n - 1)); //Formula for exp level

const TIER_COLOUR = {
  "easy":"#5fd18c", "medium":"#59b1f2", "hard":"#a880f5",
  "insane":"#ff9a3c", "nightmare":"#ff5f6d", "nightmare + odin":"#ffcf5c"
};
// ev 2 and ev15 CANNOT STACK
// pretty sure there is a 1.5x exp event.
// 2x exp event permanent for those under lvl 180 iirc