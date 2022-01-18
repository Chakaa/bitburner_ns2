//Do handle any faction stuff
import { WORK_ORDER, FACTION_WORK_LOOP_CHECK, AUGM_MIN_RESET, START_SCRIPT } from '/chakaa/lib/config.js';
import { info, log, debug, error } from '/chakaa/lib/functions.js';
import { getFactions, factionNames } from '/chakaa/lib/factions.js';
import { augs,prios,sub_prios } from '/chakaa/lib/augs.js';

let factionsList = {};
function haveAug(ns, target_aug) {
  return ns.getOwnedAugmentations(true).includes(target_aug);
}
function canBuy(ns, target_aug) {
  return ns.getAugmentationPrice(target_aug)<ns.getServerMoneyAvailable('home');
}
function knowHow(target_faction) {
  return factionsList.hasOwnProperty(target_faction);
}
function inFaction(ns, target_faction) {
  return ns.getPlayer().factions.includes(target_faction);
}

function getAugmentationScore(ns, faction, aug){
  let rep_cost = ns.getAugmentationRepReq(aug)/1000;
  let money_cost = ns.getAugmentationPrice(aug)/1000000;
  let faction_rank = factionNames[faction];
  let aug_type_prio = prios[augs[aug].type];
  let aug_stype_prio = sub_prios[augs[aug].stype];

  return rep_cost*money_cost*faction_rank/(aug_type_prio+aug_stype_prio);
}

// Pick a faction to handle.
// Currently picks the one with the lowest total reputation cost to get all the augments we don't have.
async function choose_target(ns) {
  log(ns, "Choosing a faction...");
  let target_ratio = Infinity;
  let target_name = null;
  let target_rep = Infinity;
  let target_aug = "None";
  
  for (const [key, value] of Object.entries(factionsList)) {
    for (const aug of ns.getAugmentationsFromFaction(key)) {
      if(!augs.hasOwnProperty(aug)){
        info(ns, `Unkown augmentation "${aug}" from faction ${key}.`);
        continue;
      }
      if(!haveAug(ns, aug) && prios[augs[aug].type]>0 && canBuy(ns, aug) && ( inFaction(ns,key) || knowHow(key) )){
        let r = getAugmentationScore(ns,key,aug);
        // log(ns, `Faction ${key} has augm "${aug}" with ratio ${r}.`);
        if(r>0 && target_ratio>r){
          target_ratio=r
          target_name = key;
          target_rep = ns.getAugmentationRepReq(aug);
          target_aug = aug;
        }
      }
    }
  }
  if (!target_name) {
    for (const [key, value] of Object.entries(factionsList)) {
      for (const aug of ns.getAugmentationsFromFaction(key)) {
        if(!augs.hasOwnProperty(aug)){
          info(ns, `Unkown augmentation "${aug}" from faction ${key}.`);
          continue;
        }
        if(!haveAug(ns, aug) && prios[augs[aug].type]>0 && inFaction(ns,key)){
          let r = getAugmentationScore(ns,key,aug);
          // log(ns, `Faction ${key} has augm "${aug}" with ratio ${r}.`);
          if(r>0 && target_ratio>r){
            target_ratio=r
            target_name = key;
            target_rep = ns.getAugmentationRepReq(aug);
            target_aug = aug;
          }
        }
      }
    }
    if (!target_name) {
      log(ns, `Still couldn't find any factions to handle!`);
    }else {
      log(ns, `Cannot afford any augment, but will spend my time with ${target_name}`);
      for (const WORKTYPE of WORK_ORDER) {
        if(ns.workForFaction(target_name, WORKTYPE))break;
      }
    }
  } else {
    log(ns, `Picked ${target_name} with ratio ${target_ratio} and ${target_rep} required reputation for aug "${target_aug}".`);
    return await join_faction(ns, target_name, target_rep);
  }
}

// Join the faction, getting an invite first if needed.
async function join_faction(ns, target, rep){
  if(ns.getPlayer().factions.includes(target)){
    log(ns, `Already in faction.`);
  } else if(ns.checkFactionInvitations().includes(target)){
    log(ns, `Accepting pending faction invite.`);
    ns.joinFaction(target);
  } else{
    log(ns, `Getting invitation for faction.`);
    await factionsList[target](ns);
    ns.joinFaction(target);
  }
  return await assess(ns,target,rep);
}
// Assess the state of the faction. Determine whether we need to grind rep up
// to 'rep', or up to the favour point (and then reset), or whether we can just
// donate for rep.
async function assess(ns,target, rep){
  if(ns.getFactionRep(target) >= rep){
    log(ns, `Rep requirement already met.`);
    return await loot_augs(ns, target, rep)
  // } else if(ns.getFactionFavor(target) >= ns.getFavorToDonate()){
  //   info(ns, `Favour requirement for donation met.`)
  //   return await donate_for_rep(ns,target, rep)
  // } else if (rep > 465e3){
  //   info(ns, `Faction has high rep requirements. Grinding for favour and then resetting.`)
  //   return await grind_rep(ns,target, 465e3)
  }else{
    return await grind_rep(ns, target, rep)
  }
}

async function grind_rep(ns,target, rep){
  log(ns, `Grinding ${rep} reputation from ${target}.`)
  while (ns.getFactionRep(target) < rep) {
    for (const WORKTYPE of WORK_ORDER) {
      if(ns.workForFaction(target, WORKTYPE))break;
    }
    await ns.sleep(FACTION_WORK_LOOP_CHECK);
    ns.stopAction();
  }
  
  return await loot_augs(ns, target, rep)
}

async function loot_augs(ns, target){
  ns.stopAction();
  log(ns,`Buy all augs from ${target}.`);
  let faction_augs = ns.getAugmentationsFromFaction(target);
  for(let i=0;i<faction_augs.length;i++){
    faction_augs[i] = {name:faction_augs[i], rep:ns.getAugmentationRepReq(faction_augs[i]), price:ns.getAugmentationPrice(faction_augs[i])};
  }
  faction_augs.sort((a,b) => (a.price > b.price) ? -1 : ((b.price > a.price) ? 1 : 0));
  for (const aug of faction_augs) {
    // info(ns, `checking ${aug.name} on rep ${aug.rep} and price ${aug.price} from faction ${target}`)
    if(aug.rep <= ns.getFactionRep(target) && aug.price <= ns.getServerMoneyAvailable('home') && prios[augs[aug.name].type]>0){
      // info(ns, `Buying ${aug.name} from faction ${target}`)
      ns.purchaseAugmentation(target, aug.name)
    }
  }

  // log.info("Done buying primary augs, spending the rest on NFGs.")
  // while ns.getAugmentationCost("NeuroFlux Governor")[1] <= ns.getServerMoneyAvailable 'home' do
  //   log.info("Buying NeuroFlux Governor for %s", tomoney(ns.getAugmentationCost("NeuroFlux Governor")[1]))
  //   if not ns.purchaseAugmentation(target, "NeuroFlux Governor") then
  //     log.error("Failed to buy NeuroFlux Governor from %s, cost=%.0f rep=%.0f",
  //       target, ns.getAugmentationCost("NeuroFlux Governor")[1],
  //       ns.getAugmentationCost("NeuroFlux Governor")[0])
  //     break
  //   end
  // end

  // log.info("Sleeping before installing augmentations. This is your chance to bail.")
  // -- write out logs for later debugging
  // ns.rm("/run/autofaction.log.txt")
  // for line in js.of(ns.getScriptLogs()) do
  //   ns.write("/run/autofaction.log.txt", line.."\n")
  // end
  // await ns.sleep(60)
  // ns.installAugmentations("/bin/init.ns")
}

//Get faction with currently more reput
function getMaxReputFaction(ns){
  let rep = 0;
  let target = null;
  for (const [key, value] of Object.entries(factionNames)) {
    let thisRep = ns.getFactionRep(key);
    if(thisRep>rep){
      rep=thisRep;
      target=key;
    }
  }

  return target;
}
//Decide if it is time to reset (enough bought augments)
function isItTime(ns){
  return (ns.getOwnedAugmentations(true).length-ns.getOwnedAugmentations(false).length)>AUGM_MIN_RESET;
}
//Perform pre-reset operations
function prepareReset(ns){
  // Kill running scripts
  debug(ns,"Killing scripts");
  const kills = [
    "/chakaa/init.js", //prioritize ram acquisition
    "/chakaa/run/ramManager.js", //prioritize ram acquisition
    "/chakaa/run/serversManager.js", // Prefer increasing available processing power
    "/chakaa/run/hacknetManager.js", // This isn't all that useful, but it is very inexpensive and will fit in the starting 32GB when the other two won't.
    "/chakaa/run/programManager.js", //Handle program buying and creation
    "/chakaa/run/wseManager.js", // Or play with the market
    // "chakaa/run/activityManager.js", // Or perform activities
    // "chakaa/run/gangsManager.js", // Or manage gangs
  ];
  for (const kill of kills) {
    if (ns.isRunning(kill, ns.getHostname())){
      ns.kill(kill, ns.getHostname());
    }
  }

  // Sell all portfolio now
  debug(ns,"Selling portfolio");
  try{
    for (const symbol of ns.stock.getSymbols()) {
      const [shares, avgPx, sharesShort, avgPxShort] = ns.stock.getPosition(symbol);
      if(shares>0){
        ns.stock.sell(symbol, shares);
      }
    }
  }catch(e){ debug(ns,"Issue selling stocks. No WSE API yet ?") }

  // //Buy all available augments
  debug(ns,"Buying max augments");
  try{
    let faction_augs = [];
    let curr_money = ns.getServerMoneyAvailable('home');

    for (const [key, value] of Object.entries(factionNames)) {
      let single_faction_augs = ns.getAugmentationsFromFaction(key);

      for (const aug of single_faction_augs) {
        let aug_rep = ns.getAugmentationRepReq(aug);
        let aug_pri = ns.getAugmentationPrice(aug);
        // debug(ns,`checking ${aug.name} on rep ${aug.rep} and price ${aug.price} from faction ${key}`)
        if( aug_rep <= ns.getFactionRep(key) && aug_pri <= curr_money && prios[augs[aug].type]>=0){
          faction_augs.push( {faction:key, name:aug, rep:aug_rep, price: aug_pri, prio:prios[augs[aug].type]} );
        }
      }
    }
    
    faction_augs.sort((a,b) => (a.price > b.price || (a.price == b.price && a.prio > b.prio)) ? -1 : ((b.price > a.price || (a.price == b.price && b.prio > a.prio)) ? 1 : 0));
    for (const aug of faction_augs) {
      if(aug.price <= ns.getServerMoneyAvailable('home')){
        ns.purchaseAugmentation(aug.faction, aug.name)
      }
    }
  }catch(e){ debug(ns,e) }

  // //Buy max NFGs
  debug(ns,"Buying max NFGs");
  try{
    let nfg_name = "NeuroFlux Governor";
    let faction = getMaxReputFaction(ns);
    while(ns.purchaseAugmentation(faction, nfg_name)){ }
  }catch(e){ debug(ns,"Issue buying loads of NFGs") }
}
//Install augms if it is time
function checkInstallation(ns){
  if(isItTime(ns)){
    prepareReset(ns);
    ns.installAugmentations(START_SCRIPT);
  }
}

function buyableAugs(ns){
  let item = {};

  for (const [key, value] of Object.entries(factionNames)) {
    for (const aug of ns.getAugmentationsFromFaction(key)) {
      if(isAugBuyable(ns,key,aug) && !item.hasOwnProperty(aug))
        item[aug] = key;
    }
  }
  return Object.entries(item).length;
}

function isAugBuyable(ns,faction,aug){
  if(!haveAug(ns, aug) && ns.getAugmentationRepReq(aug) <= ns.getFactionRep(faction) && ns.getAugmentationPrice(aug) <= ns.getServerMoneyAvailable('home') && prios[augs[aug].type]>=0 ){
    return true;
  }
  return false;
}

function getAugOrderedList(ns){
  let faction_augs = []
  for (const [key, value] of Object.entries(factionNames)) {
    for (const aug of ns.getAugmentationsFromFaction(key)) {
      if(!augs.hasOwnProperty(aug)){
        info(ns, `Unkown augmentation "${aug}" from faction ${key}.`);
        continue;
      }
      faction_augs.push( {faction:key, name:aug, rep:ns.getAugmentationRepReq(aug), price: ns.getAugmentationPrice(aug), prio:prios[augs[aug].type], have:haveAug(ns, aug), r:getAugmentationScore(ns,key,aug)} );
    }
  }
  faction_augs.sort((a,b) => {
    // Sort by ratio asc
    if (a.r > b.r) return -1;
    if (a.r < b.r) return 1;

    // Sort by price asc
    if (a.price > b.price) return -1;
    if (a.price < b.price) return 1;

    // Sort by prio desc
    if (a.prio > b.prio) return 1;
    if (a.prio < b.prio) return -1;
  });
  return faction_augs;
}
function nbAugmentsBuyable(ns){
  let out = 0;
  for (const aug of getAugOrderedList(ns)) {
    out += isAugBuyable(ns,aug.faction,aug.name)?1:0;
  }
  return out;
}
function bestUnbuyableAugment(ns){
  let out = 0;
  for (const aug of getAugOrderedList(ns)) {
    out += isAugBuyable(ns,aug.faction,aug.name)?1:0;
  }
  return out;
}
function shouldIInstall(ns){
  return (ns.getOwnedAugmentations(true).length-ns.getOwnedAugmentations(false).length)+nbAugmentsBuyable(ns)>AUGM_MIN_RESET;
}

/** @param {NS} ns **/
export async function main(ns) {
  // factionsList = getFactions(ns);
  
  // let faction_augs = [];
  // let curr_money = ns.getServerMoneyAvailable('home');

  // for (const [key, value] of Object.entries(factionNames)) {
  //   let single_faction_augs = ns.getAugmentationsFromFaction(key);

  //   for (const aug of single_faction_augs) {
  //     if(!haveAug(ns, aug)){
  //       let aug_rep = ns.getAugmentationRepReq(aug);
  //       let aug_pri = ns.getAugmentationPrice(aug);
  //       // debug(ns,`checking ${aug.name} on rep ${aug.rep} and price ${aug.price} from faction ${key}`)
  //       if( aug_rep <= ns.getFactionRep(key) && aug_pri <= curr_money && prios[augs[aug].type]>=0){
  //         faction_augs.push( {faction:key, name:aug, rep:aug_rep, price: aug_pri, prio:prios[augs[aug].type], r:getAugmentationScore(ns,key,aug)} );
  //       }
  //     }
  //   }
  // }

  // faction_augs.sort((a,b) => {
  //     // Sort by ratio asc
  //     if (a.r > b.r) return -1;
  //     if (a.r < b.r) return 1;

  //     // Sort by price asc
  //     if (a.price > b.price) return -1;
  //     if (a.price < b.price) return 1;

  //     // Sort by prio desc
  //     if (a.prio > b.prio) return 1;
  //     if (a.prio < b.prio) return -1;
  //   });

  ns.tprint(nbAugmentsBuyable(ns));
}