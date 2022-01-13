
let factionsList = { };

function setFaction(name) {
  return function (init) {
    factionsList[name] = init
  }
}

function setCities(name, money) {
  return setFaction(name)(async function(ns) { waitUntil(ns, haveMoney(ns, money)); ns.travelToCity(name); ns.stopAction(); waitUntil(ns, haveInvite(ns, name)); });
}
function setHackers(name, server) {
  return setFaction(name)(async function(ns) { waitUntil(ns, canHack(ns, server)); ns.stopAction(); await manualBackdoor(); waitUntil(ns, haveInvite(ns, name)); });
}

export function getFactions() {
  factionsList = { };
  setHackers('CyberSec', 'CSEC');
  setHackers('NiteSec', 'avmnite-02h');
  setHackers('The Black Hand', 'I.I.I.I');
  setHackers('BitRunners', 'run4theh111z');

  setCities('Sector-12', 15e6);
  setCities('Chongqing', 20e6);
  setCities('New Tokyo', 20e6);
  setCities('Ishima', 30e6);
  setCities('Aevum', 40e6);
  setCities('Volhaven', 50e6);

  setFaction('Tian Di Hui')(async function(ns) { 
    waitUntil(ns,allOf(haveMoney(ns,1e6), haveHackingLevel(ns,50)));
    let thisCity = ns.getPlayer().city; 
    if(thisCity!='Chongqing' && thisCity!='New Tokyo' && thisCity!='Ishima'){ns.travelToCity('Chongqing');}
    waitUntil(ns,haveInvite(ns,'Tian Di Hui')); 
  });
  setFaction('Daedalus')(async function(ns) { 
    // FIXME: we should have something here to indicate that the faction is not
    // joinable until we have 30 augs, so that we don't even attempt to join it
    // until we hit that point.
    // In practice it should be ok because the 2.5M reputation requirement for
    // The Red Pill will keep it lower priority than all the other factions.
    waitUntil(ns,haveHackingLevel(ns,2500));
    waitUntil(ns,haveInvite(ns,'Daedalus')); 
  });
  return factionsList;
}