//Do handle any additional server stuff
import { MAX_RAM,UPGRADES_TIME_BETWEEN_BUYS } from 'chakaa/lib/config.js';
import { info, log, debug, error } from 'chakaa/lib/functions.js';

export function buyRam(ns,budget) {
	if(ns.getServerMaxRam('home')>=MAX_RAM){
		// If we've hit our RAM target, only upgrade when it's cheap to do so.
    	budget = budget * 0.1
	}
	let cost = ns.getUpgradeHomeRamCost();
	if(cost<=budget){
		ns.upgradeHomeRam();
		debug(ns,`Upgraded home RAM`)
		return true;
	}
	return false;
}
export function buyCores(ns,budget) {
	let cost = ns.getUpgradeHomeCoresCost();
	if(cost<=budget){
		ns.upgradeHomeCores();
		debug(ns,`Upgraded home cores`)
		return true;
	}
	return false;
}

const actions = [
  [buyRam, 1.0]
  ,[buyCores, 0.6]
];

/** @param {NS} ns **/
export async function main(ns) {
  	ns.disableLog("ALL");
    while(true){
        let money = ns.getServerMoneyAvailable('home')
        for (const action of actions) {
			try{
				//log(ns,`Runnin function ${action[0].name}`)
				let ret = await action[0](ns, money*action[1]);
            	if(ret)break;
			}catch(e){
				error(ns, e);
				continue;
			}
        }
        await ns.sleep(UPGRADES_TIME_BETWEEN_BUYS);
    }
}