// add:    adds onto the base 1 (additive)
// mult:   multiplies the summed total afterwards (multiplicative)
// group:  boosts in the same group can't be on together (picking one turns the others off)
// onlyIn: dungeon abbrs this boost exists in; the pill is hidden for every other dungeon
const BOOSTS = [
  { id:"vip",       name:"VIP game pass", add:0.20 },
  { id:"solo",      name:"Solo",          add:0.10 },
  // Run modes: you pick one per run, so they share a group. Each multiplies the total of everything else, like HC always has.
  { id:"hc",        name:"HC (Hardcore)", mult:1.25, group:"mode" }, // 1 life, +25% XP, +30% luck, +1 drop
  { id:"nohit",     name:"No Hit",        mult:1.35, group:"mode", onlyIn:["GS"] }, // 1 life, +35% XP, +50% luck, +3 drops
  { id:"hell",      name:"Hell",          mult:1.50, group:"mode", onlyIn:["GS"] }, // 1 life, +50% XP, 2x luck, +5 drops
  { id:"hellnohit", name:"Hell + No Hit", mult:1.85, group:"mode", onlyIn:["GS"] }, // +85% XP, 2.5x luck, +8 drops
  { id:"expboost", name:"EXP Boost",     add:1.00 },
  { id:"ev2",      name:"2x EXP event",  add:1.00, group:"event" },
  { id:"ev15",     name:"1.5x EXP event",add:0.50, group:"event" }
];

const xpForLevel = n => Math.round(84 * Math.pow(1.13, n - 1)); //Formula for exp level

const TIER_COLOUR = {
  "easy":"#6ba97a", "medium":"#5b93ba", "hard":"#9483b0",
  "insane":"#ea7c2f", "nightmare":"#c2685f", "nightmare + rodin":"#c7a352", "nightmare + vytelus":"#c7a352"
};
// ev 2 and ev15 CANNOT STACK
// pretty sure there is a 1.5x exp event.
// 2x exp event permanent for those under lvl 180 iirc