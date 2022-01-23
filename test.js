//Do handle any faction stuff
import { WORK_ORDER, FACTION_WORK_LOOP_CHECK, AUGM_MIN_RESET, START_SCRIPT } from '/chakaa/lib/config.js';
import { info, log, debug, error, displayWorkAdv } from '/chakaa/lib/functions.js';
import { getFactions, factionNames, impossibleFactions } from '/chakaa/lib/factions.js';
import { augs,prios,sub_prios } from '/chakaa/lib/augs.js';

let factionsList = {};
function haveAug(ns, target_aug) {
  return ns.getOwnedAugmentations(true).includes(target_aug);
}
function knowHow(target_faction) {
  return factionsList.hasOwnProperty(target_faction);
}
function inFaction(ns, target_faction) {
  return ns.getPlayer().factions.includes(target_faction);
}
function isFactionViable(ns, target_faction){
  let impo = impossibleFactions[target_faction];
  if(!impo)return true;
  for (let i=0;i<impo.length;i++) {
    if(ns.getPlayer().factions.includes(impo[i]))
      return false;
  }
  return true;
}

function getAugmentationScore(ns, faction, aug){
  let rep_cost = ns.getAugmentationRepReq(aug)/1000;
  let money_cost = ns.getAugmentationPrice(aug)/1000000;
  let faction_rank = factionNames[faction];
  let aug_type_prio = prios[augs[aug].type];
  let aug_stype_prio = sub_prios[augs[aug].stype];

  return rep_cost*money_cost*faction_rank/(aug_type_prio+aug_stype_prio);
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
  if(!haveAug(ns, aug) && ns.getAugmentationRepReq(aug) <= ns.getFactionRep(faction) && ns.getAugmentationPrice(aug) <= ns.getServerMoneyAvailable('home') && prios[augs[aug].type]>=0 && isFactionViable(ns,faction) ){
    return true;
  }
  return false;
}
function isAugFarmable(ns,faction,aug){
  if(!haveAug(ns, aug) && ns.getAugmentationRepReq(aug) > ns.getFactionRep(faction) && prios[augs[aug].type]>0 && isFactionViable(ns,faction) ){
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
    if (a.r > b.r) return 1;
    if (a.r < b.r) return -1;

    // // Sort by price asc
    if (a.price > b.price) return 1;
    if (a.price < b.price) return -1;

    // // Sort by prio desc
    if (a.prio > b.prio) return -1;
    if (a.prio < b.prio) return 1;
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
  for (const aug of getAugOrderedList(ns)) {
    if(isAugFarmable(ns,aug.faction,aug.name) && !isAugBuyable(ns,aug.faction,aug.name)  && ( inFaction(ns,aug.faction) || knowHow(aug.faction) ) && aug.r>0 ){
      return aug;
    }   
  }
  return null;
}
function bestUnbuyableAugmentNoRestriction(ns){
  for (const aug of getAugOrderedList(ns)) {
    if(!haveAug(ns, aug) && (ns.getAugmentationRepReq(aug.name) > ns.getFactionRep(aug.faction) || inFaction(ns,aug.faction)) && prios[augs[aug.name].type]>0)
      return aug;
  }
  return null;
}

async function farmMinReputFaction(ns){
  let rep = Infinity;
  let target = null;
  for (const key of ns.getPlayer().factions ) {
    let thisRep = ns.getFactionRep(key);
    if(thisRep<rep){
      rep=thisRep;
      target=key;
    }
  }
  if(target){
    for (const WORKTYPE of WORK_ORDER) {
      if(ns.workForFaction(target, WORKTYPE))break;
    }
    // await ns.sleep(FACTION_WORK_LOOP_CHECK);
    // ns.stopAction();
  }else{
    info(ns, `But did not find any least reputed faction (something wrong).`);
  }
}

async function manageFactions(ns){
  let nextAug = bestUnbuyableAugment(ns);
  if (!nextAug) {
    let potentialNext = bestUnbuyableAugmentNoRestriction(ns);
    info(ns, `You should target this aug next [${potentialNext.faction} / ${potentialNext.name} / R:${potentialNext.rep} - $${potentialNext.price}].`);
    //info(ns, `Dont have any aug to farm, just going to the least reput faction.`);
    await farmMinReputFaction(ns);
  }else{
    info(ns, `Next aug farmed should be [${nextAug.faction}-${nextAug.name}-R:${nextAug.rep}-$${nextAug.price}].`);
    await join_faction(ns, nextAug);
  }
}

// Join the faction, getting an invite first if needed.
async function join_faction(ns, aug){
  let targetFaction = aug.faction;
  if(ns.getPlayer().factions.includes(targetFaction)){
    log(ns, `Already in faction.`);
  } else if(ns.checkFactionInvitations().includes(targetFaction)){
    log(ns, `Accepting pending faction invite.`);
    ns.joinFaction(targetFaction);
  } else{
    log(ns, `Getting invitation for faction.`);
    await factionsList[targetFaction](ns);
    ns.joinFaction(targetFaction);
  }
  return await reachAugRep(ns,aug);
}

// Do what is necessary to reach aug requisites
async function reachAugRep(ns, aug){
  let f = aug.faction;
  let r = aug.rep;
  
  //Start working
  for (const WORKTYPE of WORK_ORDER) {
    if(ns.workForFaction(f, WORKTYPE))break;
  }
  ns.print(`Started working`);

  let earned = ns.getPlayer().workRepGained + ns.getFactionRep(f);
  let cost = (r - earned) * 1e6 / ns.getPlayer().faction_rep_mult;
  let allowDonation = ns.getFactionFavor(f) >= ns.getFavorToDonate();

  displayWorkAdv(ns,aug);

  //Check if worked enough, or enough money for donation
  while(earned < r && (!allowDonation || ( allowDonation && ns.getServerMoneyAvailable('home')*.85<cost ) ) ){
    await ns.sleep(FACTION_WORK_LOOP_CHECK);
    earned = ns.getPlayer().workRepGained + ns.getFactionRep(f);
    cost = (r - earned) * 1e6 / ns.getPlayer().faction_rep_mult;

    displayWorkAdv(ns,aug);
  }
  ns.stopAction();
  ns.donateToFaction(f, (r - (ns.getPlayer().workRepGained + ns.getFactionRep(f))) * 1e6 / ns.getPlayer().faction_rep_mult);
  return true;
}

//Decide if it is time to reset (enough bought augments)
function shouldIInstall(ns){
  return (ns.getOwnedAugmentations(true).length-ns.getOwnedAugmentations(false).length)+nbAugmentsBuyable(ns)>AUGM_MIN_RESET;
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

export function getFactionStatus(ns){
  let out = ""
  for (const [key, value] of Object.entries(factionNames)) {
    let r = Math.floor(ns.getFactionRep(key));
    let f = Math.floor(ns.getFactionFavor(key));
    let augs = ns.getAugmentationsFromFaction(key);
    let aa = augs.length;
    let ba = 0;
    for(let i=0;i<augs.length;i++){
      ba += haveAug(ns,augs[i])?1:0;
    }
    let comp = Math.floor(100*ba/aa);

    out += `[${comp.toString().padStart(3,'0')}%] ${key} [${r} reputs/${f} favor]\n`
  }
  return out;
}


/** @param {NS} ns **/
export async function main(ns) {
  // let augg = "The Red Pill";
  // let facc = "Daedalus"
  // for (const aug of getAugOrderedList(ns)) {
  //   if(aug.name==augg){
  //     ns.tprint(isAugFarmable(ns,aug.faction,aug.name));
  //     ns.tprint(!isAugBuyable(ns,aug.faction,aug.name));
  //     ns.tprint(inFaction(ns,aug.faction));
  //     ns.tprint(knowHow(aug.faction));
  //     ns.tprint(aug.r>0);
  //     info(ns, `Next aug farmed should be [${aug.faction}-${aug.name}-R:${aug.rep}-$${aug.price}-r:${aug.r}].`);
  //   }
  //   // if(isAugFarmable(ns,aug.faction,aug.name) && !isAugBuyable(ns,aug.faction,aug.name)  && ( inFaction(ns,aug.faction) || knowHow(aug.faction) ) && aug.r>0 ){
  //   //   return aug;
  //   // }   
  // }
  // return null;
  // ns.applyToCompany("Four Sigma","it");
  // ns.workForCompany();
  //ns.tprint(ns.getPlayer().workRepGained + ns.getCompanyRep("Bachman & Associates"))
  ns.alert(getFactionStatus(ns))
}