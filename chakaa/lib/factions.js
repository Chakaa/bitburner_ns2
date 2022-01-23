import { waitUntil, haveMoney, haveInvite, canHack } from '/chakaa/lib/functions.js';

let factionsList = { };

export const hardConditions = {
  "money":{
    "CyberSec":0,"Tian Di Hui":1e6,"Netburners":0
    ,"Sector-12":15e6,"Chongqing":20e6,"New Tokyo":20e6,"Ishima":30e6,"Aevum":40e6,"Volhaven":50e6
    ,"NiteSec":0,"The Black Hand":0,"BitRunners":0
    ,"ECorp":0,"MegaCorp":0,"KuaiGong International":0,"Four Sigma":0,"NWO":0,"Blade Industries":0,"OmniTek Incorporated":0,"Bachman & Associates":0,"Clarke Incorporated":0,"Fulcrum Secret Technologies":0
    ,"Slum Snakes":1e6,"Tetrads":0,"Silhouette":15e6,"Speakers for the Dead":0,"The Dark Army":0,"The Syndicate":10e6
    ,"The Covenant":75e9,"Daedalus":100e9,"Illuminati":150e9
  }
  ,"installedAugs":{
    "CyberSec":0,"Tian Di Hui":0,"Netburners":0
    ,"Sector-12":0,"Chongqing":0,"New Tokyo":0,"Ishima":0,"Aevum":0,"Volhaven":0
    ,"NiteSec":0,"The Black Hand":0,"BitRunners":0
    ,"ECorp":0,"MegaCorp":0,"KuaiGong International":0,"Four Sigma":0,"NWO":0,"Blade Industries":0,"OmniTek Incorporated":0,"Bachman & Associates":0,"Clarke Incorporated":0,"Fulcrum Secret Technologies":0
    ,"Slum Snakes":0,"Tetrads":0,"Silhouette":0,"Speakers for the Dead":0,"The Dark Army":0,"The Syndicate":0
    ,"The Covenant":20,"Daedalus":30,"Illuminati":30
  }
  ,"stats":{ //["Hacking","Strength","Defense","Dexterity","Agility","Charisma"]
    "CyberSec":[0,0,0,0,0,0],"Tian Di Hui":[50,0,0,0,0,0],"Netburners":[80,0,0,0,0,0]
    ,"Sector-12":[50,0,0,0,0,0],"Chongqing":[0,0,0,0,0,0],"New Tokyo":[0,0,0,0,0,0],"Ishima":[0,0,0,0,0,0],"Aevum":[0,0,0,0,0,0],"Volhaven":[0,0,0,0,0,0]
    ,"NiteSec":[0,0,0,0,0,0],"The Black Hand":[0,0,0,0,0,0],"BitRunners":[0,0,0,0,0,0]
    ,"ECorp":[0,0,0,0,0,0],"MegaCorp":[0,0,0,0,0,0],"KuaiGong International":[0,0,0,0,0,0],"Four Sigma":[0,0,0,0,0,0],"NWO":[0,0,0,0,0,0],"Blade Industries":[0,0,0,0,0,0],"OmniTek Incorporated":[0,0,0,0,0,0],"Bachman & Associates":[0,0,0,0,0,0],"Clarke Incorporated":[0,0,0,0,0,0],"Fulcrum Secret Technologies":[0,0,0,0,0,0]
    ,"Slum Snakes":[0,30,30,30,30,0],"Tetrads":[0,75,75,75,75,0],"Silhouette":[0,0,0,0,0,0],"Speakers for the Dead":[100,300,300,300,300,0],"The Dark Army":[300,300,300,300,300,0],"The Syndicate":[200,200,200,200,200,0]
    ,"The Covenant":[850,850,850,850,850,0],"Daedalus":[2500,0,0,0,0,0],"Illuminati":[1500,1200,1200,1200,1200,0]
  }
  ,"hacknet":{ //["Level","RAM","Core"]
    "CyberSec":[0,0,0],"Tian Di Hui":[0,0,0],"Netburners":[100,8,4]
    ,"Sector-12":[0,0,0],"Chongqing":[0,0,0],"New Tokyo":[0,0,0],"Ishima":[0,0,0],"Aevum":[0,0,0],"Volhaven":[0,0,0]
    ,"NiteSec":[0,0,0],"The Black Hand":[0,0,0],"BitRunners":[0,0,0]
    ,"ECorp":[0,0,0],"MegaCorp":[0,0,0],"KuaiGong International":[0,0,0],"Four Sigma":[0,0,0],"NWO":[0,0,0],"Blade Industries":[0,0,0],"OmniTek Incorporated":[0,0,0],"Bachman & Associates":[0,0,0],"Clarke Incorporated":[0,0,0],"Fulcrum Secret Technologies":[0,0,0]
    ,"Slum Snakes":[0,0,0],"Tetrads":[0,0,0],"Silhouette":[0,0,0],"Speakers for the Dead":[0,0,0],"The Dark Army":[0,0,0],"The Syndicate":[0,0,0]
    ,"The Covenant":[0,0,0],"Daedalus":[0,0,0],"Illuminati":[0,0,0]
  }
  ,"backdoored":{
    "CyberSec":"CSEC","Tian Di Hui":null,"Netburners":null
    ,"Sector-12":null,"Chongqing":null,"New Tokyo":null,"Ishima":null,"Aevum":null,"Volhaven":null
    ,"NiteSec":"avmnite-02h","The Black Hand":"I.I.I.I","BitRunners":"run4theh111z"
    ,"ECorp":null,"MegaCorp":null,"KuaiGong International":null,"Four Sigma":null,"NWO":null,"Blade Industries":null,"OmniTek Incorporated":null,"Bachman & Associates":null,"Clarke Incorporated":null,"Fulcrum Secret Technologies":"fulcrumassets"
    ,"Slum Snakes":null,"Tetrads":null,"Silhouette":null,"Speakers for the Dead":null,"The Dark Army":null,"The Syndicate":null
    ,"The Covenant":null,"Daedalus":null,"Illuminati":null
  }
  ,"location":{
    "CyberSec":null,"Tian Di Hui":"Chongqing","Netburners":null
    ,"Sector-12":"Sector-12","Chongqing":"Chongqing","New Tokyo":"New Tokyo","Ishima":"Ishima","Aevum":"Aevum","Volhaven":"Volhaven"
    ,"NiteSec":null,"The Black Hand":null,"BitRunners":null
    ,"ECorp":null,"MegaCorp":null,"KuaiGong International":null,"Four Sigma":null,"NWO":null,"Blade Industries":null,"OmniTek Incorporated":null,"Bachman & Associates":null,"Clarke Incorporated":null,"Fulcrum Secret Technologies":null
    ,"Slum Snakes":null,"Tetrads":"Chongqing","Silhouette":null,"Speakers for the Dead":null,"The Dark Army":"Chongqing","The Syndicate":"Sector-12"
    ,"The Covenant":null,"Daedalus":null,"Illuminati":null
  }
  ,"incompatible":{
    "CyberSec":null,"Tian Di Hui":null,"Netburners":null
    ,"Sector-12":["Chongqing","New Tokyo","Ishima","Volhaven"],"Chongqing":["Sector-12","Aevum","Volhaven"],"New Tokyo":["Sector-12","Aevum","Volhaven"],"Ishima":["Sector-12","Aevum","Volhaven"],"Aevum":["Chongqing","New Tokyo","Ishima","Volhaven"],"Volhaven":["Sector-12","Aevum","Chongqing","New Tokyo","Ishima"]
    ,"NiteSec":null,"The Black Hand":null,"BitRunners":null
    ,"ECorp":null,"MegaCorp":null,"KuaiGong International":null,"Four Sigma":null,"NWO":null,"Blade Industries":null,"OmniTek Incorporated":null,"Bachman & Associates":null,"Clarke Incorporated":null,"Fulcrum Secret Technologies":null
    ,"Slum Snakes":null,"Tetrads":null,"Silhouette":null,"Speakers for the Dead":null,"The Dark Army":null,"The Syndicate":null
    ,"The Covenant":null,"Daedalus":null,"Illuminati":null
  }
  ,"megacorps":{
    "CyberSec":null,"Tian Di Hui":null,"Netburners":null
    ,"Sector-12":null,"Chongqing":null,"New Tokyo":null,"Ishima":null,"Aevum":null,"Volhaven":null
    ,"NiteSec":null,"The Black Hand":null,"BitRunners":null
    ,"ECorp":"ECorp","MegaCorp":"MegaCorp","KuaiGong International":"KuaiGong International","Four Sigma":"Four Sigma","NWO":"NWO","Blade Industries":"Blade Industries","OmniTek Incorporated":"OmniTek Incorporated","Bachman & Associates":"Bachman & Associates","Clarke Incorporated":"Clarke Incorporated","Fulcrum Secret Technologies":"Fulcrum Technologies"
    ,"Slum Snakes":null,"Tetrads":null,"Silhouette":null,"Speakers for the Dead":null,"The Dark Army":null,"The Syndicate":null
    ,"The Covenant":null,"Daedalus":null,"Illuminati":null
  }
}

export const factionNames = {
  "CyberSec":1,"Tian Di Hui":1,"Netburners":1
  ,"Sector-12":2,"Chongqing":3,"New Tokyo":1,"Ishima":1,"Aevum":2,"Volhaven":1
  ,"NiteSec":2,"The Black Hand":3,"BitRunners":4
  ,"ECorp":6,"MegaCorp":6,"KuaiGong International":6,"Four Sigma":6,"NWO":6,"Blade Industries":6,"OmniTek Incorporated":6,"Bachman & Associates":6,"Clarke Incorporated":6,"Fulcrum Secret Technologies":6
  ,"Slum Snakes":9,"Tetrads":9,"Silhouette":9,"Speakers for the Dead":9,"The Dark Army":9,"The Syndicate":9
  ,"The Covenant":6,"Daedalus":6,"Illuminati":6
}

export const impossibleFactions = {
  "Sector-12": ["Chongqing","New Tokyo","Ishima","Volhaven"]
  ,"Aevum": ["Chongqing","New Tokyo","Ishima","Volhaven"]
  ,"Chongqing": ["Sector-12","Aevum","Volhaven"]
  ,"New Tokyo": ["Sector-12","Aevum","Volhaven"]
  ,"Ishima": ["Sector-12","Aevum","Volhaven"]
  ,"Volhaven": ["Sector-12","Aevum","Chongqing","New Tokyo","Ishima"]
}

function setFaction(name) {
  return function (init) {
    factionsList[name] = init
  }
}

// function setCities(name, money) {
//   return setFaction(name)(async function(ns) { ns.tprint(`Trying to join ${name}`); await waitUntil(ns, haveMoney(ns, money)); ns.travelToCity(name); ns.stopAction(); await waitUntil(ns, haveInvite(ns, name)); });
// }
// function setHackers(name, server) {
//   return setFaction(name)(async function(ns) { await waitUntil(ns, canHack(ns, server)); await waitUntil(ns, haveInvite(ns, name)); });
//   // return setFaction(name)(async function(ns) { waitUntil(ns, canHack(ns, server)); ns.stopAction(); await manualBackdoor(); waitUntil(ns, haveInvite(ns, name)); });
// }
// function setMegaCorp(name, city, company, server) {
//   return setFaction(name)(async function(ns) { await waitUntil(ns, haveInvite(ns, name)); });
// }
function setMover(factionName){
  return setFaction(factionName)(async function(ns) { ns.tprint(`Trying to join ${factionName}`); if(ns.getPlayer().city!=hardConditions["location"][factionName]){ns.travelToCity(hardConditions["location"][factionName])} });
}
function setJob(factionName){
  return setFaction(factionName)(async function(ns) {
    ns.tprint(`Trying to join ${factionName}`);
    ns.applyToCompany(hardConditions["megacorps"][factionName],"it");
    ns.workForCompany();
    while(ns.getPlayer().workRepGained + ns.getCompanyRep(hardConditions["megacorps"][factionName])<200000){
      await ns.sleep(60000);
      ns.stopAction();
      ns.applyToCompany(hardConditions["megacorps"][factionName],"it");
      ns.workForCompany();
    } 
  });
}

export function getFactions() {
  factionsList = { };
  
  //Early Game
  // setFaction('Tian Di Hui')(async function(ns) {
  //   if(ns.getPlayer().city!=hardConditions["location"]["Tian Di Hui"])
  //     ns.travelToCity(hardConditions["location"]["Tian Di Hui"])
  //   waitUntil(ns,haveInvite(ns,'Tian Di Hui')); 
  // });
  setMover('Tian Di Hui');
  //Cities
  setMover('Sector-12');
  setMover('Chongqing');
  setMover('New Tokyo');
  setMover('Ishima');
  setMover('Aevum');
  setMover('Volhaven');
  //Megacorpos
  setJob('ECorp');
  setJob('MegaCorp');
  setJob('KuaiGong International');
  setJob('Four Sigma');
  setJob('NWO');
  setJob('Blade Industries');
  setJob('OmniTek Incorporated');
  setJob('Bachman & Associates');
  setJob('Clarke Incorporated');
  setJob('Fulcrum Secret Technologies');

  // setMegaCorp("ECorp", "Aevum", "ECorp", "ecorp");
  // setMegaCorp("MegaCorp", "Sector-12", "MegaCorp", "megacorp");
  // setMegaCorp("KuaiGong International", "Chongqing", "KuaiGong International", "kuai-gong");
  // setMegaCorp("Four Sigma", "Sector-12", "Four Sigma", "4sigma");
  // setMegaCorp("NWO", "Volhaven", "NWO", "nwo");
  // setMegaCorp("Blade Industries", "Sector-12", "Blade Industries", "blade");
  // setMegaCorp("OmniTek Incorporated", "Volhaven", "OmniTek Incorporated", "omnitek");
  // setMegaCorp("Bachman & Associates", "Aevum", "Bachman & Associates", "b-and-a");
  // setMegaCorp("Clarke Incorporated", "Aevum", "Clarke Incorporated", "clarkinc");
  // setMegaCorp("Fulcrum Secret Technologies", "Aevum", "Fulcrum Technologies", "fulcrumtech");

  // setFaction('Daedalus')(async function(ns) { 
  //   // FIXME: we should have something here to indicate that the faction is not
  //   // joinable until we have 30 augs, so that we don't even attempt to join it
  //   // until we hit that point.
  //   // In practice it should be ok because the 2.5M reputation requirement for
  //   // The Red Pill will keep it lower priority than all the other factions.
  //   waitUntil(ns,haveHackingLevel(ns,2500));
  //   waitUntil(ns,haveInvite(ns,'Daedalus')); 
  // });
  return factionsList;
}