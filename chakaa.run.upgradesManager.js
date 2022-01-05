//Do handle any additional server stuff
import { SPIKES,UTILS,MAX_RAM,UPGRADES_TIME_BETWEEN_BUYS } from './chakaa.lib.config.js';
import { info, log, debug, error, toMoney } from './chakaa.lib.functions.js';

export function buyTor(ns,budget) {
	if(ns.getPlayer().tor)return false;
	if(budget < 2e5)return true;
	ns.purchaseTor();
	return true;
}

export function buySpikes(ns,budget) {
    for (const program of SPIKES) {
		if(!ns.fileExists(program) && ns.purchaseProgram(program))return true;
	}
	return false;
}

export function buyUtilities(ns,budget) {
    for (const program of UTILS) {
		if(!ns.fileExists(program) && ns.purchaseProgram(program))return true;
	}
	return false;
}

export function buyRam(ns,budget) {
	if(ns.getServerMaxRam('home')>=MAX_RAM){
		// If we've hit our RAM target, only upgrade when it's cheap to do so.
    	budget = budget * 0.1
	}
	let cost = ns.getUpgradeHomeRamCost();
	if(cost<=budget){
		ns.upgradeHomeRam();
		return true;
	}
	return false;
}

const actions = [
  [buyRam, 1.0],
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
				let ret = await action[0](ns, money*action[1]);
            	if(ret)break;
			}catch(e){
				error(ns, e);
				continue;
			}
        }
        await ns.sleep(UPGRADES_TIME_BETWEEN_BUYS);
    }

    //old stuff
    // await upgradeServers(ns);
    // while(true){
    //     await ns.sleep(60000);
    //     await upgradeServers(ns);
    // }
}
/*
const targetFormat = "$0.00a";

export async function upgradeServers(ns) {
    let moneyPart = .3;
	let e = 3;
	let ram = Math.pow(2,e);
	let maxRam=ns.getPurchasedServerMaxRam();
	let maxBought = ns.serverExists("pserv-24");
	if(maxBought && ns.getServerRam("pserv-24")[0]>=maxRam)
		return;
	while(ram<maxRam){
		let i = 0;
		ram = Math.pow(2,e);
		
		while (i < ns.getPurchasedServerLimit()) {
			let targetHostname = "pserv-" + i;
			let serverCost = ns.getPurchasedServerCost(ram);
			ns.print(`Trying to create server ${targetHostname} with ${ram}Gb for ${ns.nFormat(serverCost, targetFormat)}`);
			
			let serverExists = ns.serverExists(targetHostname);
			let lessRam = ns.serverExists(targetHostname) && ns.getServerRam(targetHostname)[0]<ram;
			let currentMoney = ns.getServerMoneyAvailable("home");
			let minMoney = ns.getServerMoneyAvailable("home")*(ns.getPurchasedServers().length!=ns.getPurchasedServerLimit() || maxBought?1:moneyPart);
			let minOwnedMoney = ns.getServerMoneyAvailable("home")/(ns.getPurchasedServers().length!=ns.getPurchasedServerLimit() || maxBought?1:moneyPart);
			let enoughMoney = minMoney > serverCost ;

			if(serverExists && !lessRam){
				ns.print("   Server already exists with "+ns.getServerRam(targetHostname)[0]+"Gb");
			}else if((serverExists && lessRam) || !serverExists){
				if(enoughMoney){
					if(serverExists){
						ns.print("   Server already exists with "+ns.getServerRam(targetHostname)[0]+"Gb, so deleting");
						await ns.killall(targetHostname);
						await ns.deleteServer(targetHostname);
					}
					await purchaseAndRun(ns,targetHostname,ram);
				}else{
					//ns.print(`Not enough money: ${ns.nFormat(ns.getServerMoneyAvailable("home"), targetFormat)}/${ns.nFormat(ns.getServerMoneyAvailable("home")/(ns.getPurchasedServers().length!=ns.getPurchasedServerLimit()?1:moneyPart), targetFormat)}`);
					ns.print(`Not enough money: ${ns.nFormat(currentMoney, targetFormat)}/${ns.nFormat(minOwnedMoney, targetFormat)}`);
					return;
				}
			}
			++i;
			await ns.sleep(10);
		}
		++e;
	}
}

export async function purchaseAndRun(ns,targetHostname,ram) {
	let ramUsageOfScript = ns.getScriptRam("basicHack.ns");
	let maxNumThreads = Math.floor(ram / ramUsageOfScript);
    let target = !ns.getServer("joesguns").hasAdminRights?"n00dles":"joesguns";
	ns.print("Trying to purchase server "+targetHostname+" and running "+maxNumThreads+" threads");

	if(maxNumThreads>=1){
		var hostname = await ns.purchaseServer(targetHostname, ram);
		await ns.scp("basicHack.ns", hostname);
		ns.exec("basicHack.ns", hostname, maxNumThreads,target);
		ns.print("Bought it and sent the script");
	}
}
*/