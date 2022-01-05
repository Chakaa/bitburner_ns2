//Do handle any faction stuff
import { FACTION_WORK_LOOP_CHECK, WORK_ORDER } from './chakaa.lib.config.js';
import { info, log, debug, error } from './chakaa.lib.functions.js';
import { getFactions } from './chakaa.lib.factions.js';
import { augs } from './chakaa.lib.augs.js';

function haveAug(ns, target_aug) {
  return ns.getOwnedAugmentations(true).includes(target_aug);
}

function inFaction(ns, target_faction) {
  return ns.getPlayer().factions.includes(target_faction);
}

let factionsList = {};

// Pick a faction to eat.
// Currently picks the one with the lowest total reputation cost to get all the augments we don't have.
async function choose_target(ns) {
  info(ns, "Choosing a faction...");
  let target_name = null;
  let target_rep = Infinity;

  for (const [key, value] of Object.entries(factionsList)) {
    let rep = 0;
    for (const aug of ns.getAugmentationsFromFaction(key)) {
      if (augs[aug].priority > 0 && !haveAug(aug)) {
        let cost = ns.getAugmentationCost(aug); // should maybe be replace by getAugmentationRepCost but not sure
        rep = Math.max(rep, cost[0]);
      }
      info(ns, `Faction ${key} has reputation cost ${rep}.`);
      if (rep > 0 && rep < target_rep) {
        target_name = key;
        target_rep = rep;
      }
    }
    if (!target_name) {
      info(ns, `Couldn't find any factions to eat!`);
    } else {
      info(ns, `Picked ${target_name} with ${target_rep} required reputation.`);
      return join_faction(ns, target_name, target_rep);
    }
  }
}

// Join the faction, getting an invite first if needed.
async function join_faction(ns, target, rep){
  return true;
  if(ns.getPlayer().factions.includes(target)){
    info(ns, `Already in faction.`);
  } else if(ns.checkFactionInvitations().includes(target)){
    info(ns, `Accepting pending faction invite.`);
    ns.joinFaction(target);
  } else{
    info(ns, `Getting invitation for faction.`);
    await factionsList[target](ns);
    ns.joinFaction(target);
  }
  return assess(ns,target,rep);
}

// Assess the state of the faction. Determine whether we need to grind rep up
// to 'rep', or up to the favour point (and then reset), or whether we can just
// donate for rep.
async function assess(ns,target, rep){
  if(ns.getFactionRep(target) >= rep){
    info(ns, `Rep requirement already met.`);
    return loot_augs(ns,target, rep)
  // } else if(ns.getFactionFavor(target) >= ns.getFavorToDonate()){
  //   info(ns, `Favour requirement for donation met.`)
  //   return donate_for_rep(ns,target, rep)
  // } else if (rep > 465e3){
  //   info(ns, `Faction has high rep requirements. Grinding for favour and then resetting.`)
  //   return grind_rep(ns,target, 465e3)
  }else{
    return grind_rep(ns,target, rep)
  }
}

async function grind_rep(ns,target, rep){
  info(`Grind ${rep} reputation from ${target}.`)
  while (getFactionRep(target) < rep) {
    for (const WORKTYPE of WORK_ORDER) {
      if(ns.workForFaction(target, WORKTYPE))break;
    }
    await ns.sleep(FACTION_WORK_LOOP_CHECK);
  }
  
  return loot_augs(ns, target, rep)
}

async function donate_for_rep(ns,target, rep){
  info(`Donating to ${target} to get to reputation ${rep}.`)
  // ns.workForFaction(target, 'hacking')
  // w.waitUntil(ns,function(ns){
  //   let earned = ns.getCharacterInformation().workRepGain + ns.getFactionRep(target);
  //   let cost = (rep - earned) * 1e6 / ns.getCharacterInformation().mult.factionRep;
  //   info(ns, "Donating %s to %s for %.0f reputation", tomoney(cost), target, rep - earned)
  //   return w.haveMoney(ns,cost)()}
  // );
  // let earned = ns.getCharacterInformation().workRepGain + ns.getFactionRep(target);
  // let cost = (rep - earned) * 1e6 / ns.getCharacterInformation().mult.factionRep;
  // ns.donateToFaction(target, cost)
  return loot_augs(ns,target, rep)
}

async function buyAugmentation(ns,faction, aug){
  if(haveAug(aug)) return true;
  for(prereq of ns.getAugmentationPrereq(aug)){
    if(!buyAugmentation(faction, prereq)){
      info(ns, "Couldn't buy prerequisite augmentation %s for %s", prereq, aug)
      return false
    }
  }
  let price = ns.getAugmentationCost(aug)[1];
  info(ns, "Buying %s from %s for %s", aug, faction, tomoney(price))
  w.waitUntil(ns,w.haveMoney(price))
  return ns.purchaseAugmentation(faction, aug)
}

// async function loot_augs(ns, target, rep){
//   ns.stopAction()
//   info(ns,`Buy all augs from ${target}.`)
//   let faction_augs = js.totable(ns.getAugmentationsFromFaction(target))
//   for i,aug in ipairs(faction_augs) do
//     local cost = ns.getAugmentationCost(aug)
//     faction_augs[i] = { name = aug, rep = cost[0], price = cost[1] }
//   end
//   table.sort(faction_augs, function(x,y) return x.price > y.price end)
//   for _,aug in ipairs(faction_augs) do
//     if aug.rep <= rep and augs[aug.name].priority >= 0 then
//       buyAugmentation(target, aug.name)
//     end
//   end
//   log.info("Done buying primary augs, spending the rest on NFGs.")
//   while ns.getAugmentationCost("NeuroFlux Governor")[1] <= ns.getServerMoneyAvailable 'home' do
//     log.info("Buying NeuroFlux Governor for %s", tomoney(ns.getAugmentationCost("NeuroFlux Governor")[1]))
//     if not ns.purchaseAugmentation(target, "NeuroFlux Governor") then
//       log.error("Failed to buy NeuroFlux Governor from %s, cost=%.0f rep=%.0f",
//         target, ns.getAugmentationCost("NeuroFlux Governor")[1],
//         ns.getAugmentationCost("NeuroFlux Governor")[0])
//       break
//     end
//   end
//   log.info("Sleeping before installing augmentations. This is your chance to bail.")
//   -- write out logs for later debugging
//   ns.rm("/run/autofaction.log.txt")
//   for line in js.of(ns.getScriptLogs()) do
//     ns.write("/run/autofaction.log.txt", line.."\n")
//   end
//   await ns.sleep(60)
//   ns.installAugmentations("/bin/init.ns")
// }

/** @param {NS} ns **/
export async function main(ns) {
  factionsList = getFactions(ns);
  await choose_target(ns);
}