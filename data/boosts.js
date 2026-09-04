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
  "easy":"#6ba97a", "medium":"#5b93ba", "hard":"#9483b0",
  "insane":"#ea7c2f", "nightmare":"#c2685f", "nightmare + rodin":"#c7a352"
};
// ev 2 and ev15 CANNOT STACK
// pretty sure there is a 1.5x exp event.
// 2x exp event permanent for those under lvl 180 iirc
