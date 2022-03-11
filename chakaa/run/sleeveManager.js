//Do handle any hacknet stuff
import { SLEEVES_TIME_BETWEEN_BUYS, UNIS, HACKORDER, FIELDORDER, SECUORDER } from 'chakaa/lib/config.js';
import { info, log, debug, toMoney, niceNumberDisplay } from 'chakaa/lib/functions.js';
import { workNames } from '/chakaa/lib/factions.js';

export async function handleSleeves(ns, budget) {
    let sl = ns.sleeve;
    let hackFaction = "";
    let fieldFaction = "";
    let secuFaction = "";
    
    for (const key of ns.getPlayer().factions ) {
        if(hackFaction=="" && workNames[key][0]==1){
            hackFaction = key;
        }
        if(fieldFaction=="" && workNames[key][1]==1){
            fieldFaction = key;
        }
        if(secuFaction=="" && workNames[key][2]==1){
            secuFaction = key;
        }
        if(hackFaction!="" && fieldFaction!="" && secuFaction!="")break;
    }

    for(let i=0;i<sl.getNumSleeves();i++){
        let city = sl.getInformation(i).city;
        let purchAugs = sl.getSleevePurchasableAugs(i);
        for(let j=0;j<purchAugs.length;j++){
            if(purchAugs[j].cost<=budget){
                sl.purchaseSleeveAug(i,purchAugs[j].name);
                budget-=purchAugs[j].cost
            }
        }

        let sStats = sl.getSleeveStats(i);
        if(sStats.shock>0){
            sl.setToShockRecovery(i);
        }else if(sStats.sync<100){
            sl.setToSynchronize(i);
        }else if(hackFaction && (sStats.hacking<sStats.agility || sStats.hacking<sStats.defense || sStats.hacking<sStats.dexterity || sStats.hacking<sStats.strength)){
            for (const WORKTYPE of HACKORDER) {
              if(sl.setToFactionWork(i, hackFaction, WORKTYPE))break;
            }
        }else if(fieldFaction && (sStats.hacking>sStats.agility && sStats.hacking>sStats.defense && sStats.hacking>sStats.dexterity && sStats.hacking>sStats.strength)){
            for (const WORKTYPE of FIELDORDER) {
              if(sl.setToFactionWork(i, fieldFaction, WORKTYPE))break;
            }
        }else if(secuFaction && (sStats.hacking>sStats.agility && sStats.hacking>sStats.defense && sStats.hacking>sStats.dexterity && sStats.hacking>sStats.strength)){
            for (const WORKTYPE of SECUORDER) {
              if(sl.setToFactionWork(i, secuFaction, WORKTYPE))break;
            }
        }else{
            if(city!="Sector-12"){
                sl.travel(i,"Sector-12");
            }
            sl.setToUniversityCourse(i,UNIS[sl.getInformation(i).city][0],"Study Computer Science");
        }
    }
    return false;
}

const actions = [
  [handleSleeves, 0.5]
];

/** @param {NS} ns **/
export async function main(ns) {
  	ns.disableLog("ALL");
    while(true){
        let money = ns.getServerMoneyAvailable('home')
        for (const action of actions) {
            let ret = await action[0](ns,money*action[1]);
            if(ret)break;
        }
        await ns.sleep(SLEEVES_TIME_BETWEEN_BUYS);
    }
}