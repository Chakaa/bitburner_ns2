import { waitUntil, haveMoney, haveInvite, canHack } from '/chakaa/lib/functions.js';

let factionsList = { };

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

function setCities(name, money) {
  return setFaction(name)(async function(ns) { ns.tprint(`Trying to join ${name}`); await waitUntil(ns, haveMoney(ns, money)); ns.travelToCity(name); ns.stopAction(); await waitUntil(ns, haveInvite(ns, name)); });
}
function setHackers(name, server) {
  return setFaction(name)(async function(ns) { await waitUntil(ns, canHack(ns, server)); await waitUntil(ns, haveInvite(ns, name)); });
  // return setFaction(name)(async function(ns) { waitUntil(ns, canHack(ns, server)); ns.stopAction(); await manualBackdoor(); waitUntil(ns, haveInvite(ns, name)); });
}
function setMegaCorp(name, city, server) {
  return setFaction(name)(async function(ns) { await waitUntil(ns, haveInvite(ns, name)); });
}

export function getFactions() {
  factionsList = { };

  //Early Game
  setHackers('CyberSec', 'CSEC');
  setFaction('Tian Di Hui')(async function(ns) { 
    waitUntil(ns,allOf(haveMoney(ns,1e6), haveHackingLevel(ns,50)));
    let thisCity = ns.getPlayer().city; 
    if(thisCity!='Chongqing' && thisCity!='New Tokyo' && thisCity!='Ishima'){ns.travelToCity('Chongqing');}
    waitUntil(ns,haveInvite(ns,'Tian Di Hui')); 
  });
  setFaction('Netburners')(async function(ns) { 
    waitUntil(ns,haveHackingLevel(ns,80));
    waitUntil(ns,haveHacknetLvls(ns,100));
    waitUntil(ns,haveHacknetRam(ns,8));
    waitUntil(ns,haveHacknetCores(ns,4));
    waitUntil(ns,haveInvite(ns,'Netburners')); 
  });

  //Cities
  setCities('Sector-12', 15e6);
  setCities('Chongqing', 20e6);
  setCities('New Tokyo', 20e6);
  setCities('Ishima', 30e6);
  setCities('Aevum', 40e6);
  setCities('Volhaven', 50e6);

  //Hackers
  setHackers('NiteSec', 'avmnite-02h');
  setHackers('The Black Hand', 'I.I.I.I');
  setHackers('BitRunners', 'run4theh111z');

  //Megacorpos
  // setMegaCorp("ECorp", "trouducudumond", "toto");
  // setMegaCorp("MegaCorp", "Sector-12", "toto");
  // setMegaCorp("KuaiGong International", "trouducudumond", "toto");
  // setMegaCorp("Four Sigma", "Sector-12", "toto");
  // setMegaCorp("NWO", "trouducudumond", "toto");
  // setMegaCorp("Blade Industries", "Sector-12", "toto");
  // setMegaCorp("OmniTek Incorporated", "trouducudumond", "toto");
  // setMegaCorp("Bachman & Associates", "trouducudumond", "toto");
  // setMegaCorp("Clarke Incorporated", "trouducudumond", "toto");
  // setMegaCorp("Fulcrum Secret Technologies", "trouducudumond", "toto");

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