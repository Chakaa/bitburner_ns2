//Do handle any additional server stuff
import { SPIKES,UTILS,UPGRADES_TIME_BETWEEN_BUYS } from 'chakaa/lib/config.js';
import { info, log, debug, error } from 'chakaa/lib/functions.js';

export function buyTor(ns,budget) {
	if(ns.getPlayer().tor)return false;
	if(budget < 2e5)return true;
	ns.purchaseTor();
	debug(ns,`Bought TOR`)
	return true;
}

export function unlockWse(ns,budget) {
	return false;
}

export function buySpikes(ns,budget) {
    for (const program of SPIKES) {
		if(!ns.fileExists(program) && ns.purchaseProgram(program)){
			debug(ns,`Bought ${program}`)
			return true;
		}
	}
	return false;
}

export function buyUtilities(ns,budget) {
    for (const program of UTILS) {
		if(!ns.fileExists(program) && ns.purchaseProgram(program)){
			debug(ns,`Bought ${program}`)
			return true;
		}
	}
	return false;
}

const actions = [
  [buyTor, 0.9],
  [buySpikes, 0.9],
  [buyUtilities, 0.05],
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