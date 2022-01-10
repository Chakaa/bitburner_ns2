//Do handle any additional server stuff
import { RAM_MIN,RAM_MAX,SERVER_TIME_BETWEEN_BUYS } from './chakaa.lib.config.js';
import { info, log, debug, error, toMoney } from './chakaa.lib.functions.js';

export function sizeServerToMoney(ns,budget) {
  let ram = RAM_MIN/2;
  while(ns.getPurchasedServerCost(ram*2) <= budget){
	  ram = ram*2
  }
  return ram;
}

export async function buyNewServer(ns,budget) {
	debug(ns,`BuyNewServer(budget=${budget})`);
	let nservers = ns.getPurchasedServers().length;
	if(nservers >= ns.getPurchasedServerLimit())return false;

	let ram = sizeServerToMoney(ns, budget);
	if(ram < RAM_MIN) return false;

	let name = (`pserv-${nservers}`);
	let cost = ns.getPurchasedServerCost(ram);

	info(ns, `Buying server ${name} (${ram}GB) for $${cost}`);
	ns.purchaseServer(name, ram)
	return true;
}

export async function upgradeServer(ns,budget) {
	debug(ns,`UpgradeServer(budget=${budget})`);
	let servers = ns.getPurchasedServers();
	if(servers.length < ns.getPurchasedServerLimit()) return false;

	let smallest = {ram:Infinity,host:null};
	for (const server of servers) {
    	let ram = ns.getServerMaxRam(server)
		if(ram < smallest.ram)
			smallest = {ram:ram,host:server}
	}

	let new_ram = sizeServerToMoney(ns, budget);
	if(new_ram<=smallest.ram)return false;
	let cost = ns.getPurchasedServerCost(new_ram);
	
	info(ns, `Upgrading ${smallest.host} (${smallest.ram}GB) to ${new_ram}GB for $${cost}`);
	
	while(ns.ps(smallest.host).length>0){
		ns.killall(smallest.host)
		await ns.sleep(0.1)
	}

	if(!ns.deleteServer(smallest.host)){
		error(ns, `Couldn't delete server ${smallest.host}, aborting upgrade.`)
    	return false
	}

	return ns.purchaseServer(smallest.host, new_ram) != "";
}

const actions = [
  [buyNewServer, 0.3],
  [upgradeServer, 0.004]
];

/** @param {NS} ns **/
export async function main(ns) {
  	ns.disableLog("ALL");
    while(true){
        let money = ns.getServerMoneyAvailable('home')
        for (const action of actions) {
            let ret = await action[0](ns, money*action[1]);
            if(ret)break;
        }
        await ns.sleep(SERVER_TIME_BETWEEN_BUYS);
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