import { FACTION_INVITE_EXCLUSION,ACCEPT_FACTION_LOOP_CHECK } from 'chakaa/lib/config.js';

function acceptAllInvites(ns){
    for (const invite of ns.checkFactionInvitations()) {
        if(!FACTION_INVITE_EXCLUSION.includes(invite))
            ns.joinFaction(invite);
    }
}

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");
  while(true){
    try{
      acceptAllInvites(ns);
    }catch(e){}
    await ns.sleep(ACCEPT_FACTION_LOOP_CHECK); //wait 15s before checking any other backdooring
  }
}