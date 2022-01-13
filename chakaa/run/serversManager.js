//Do handle any additional server stuff
import { RAM_MIN,RAM_MAX,SERVER_TIME_BETWEEN_BUYS } from 'chakaa/lib/config.js';
import { info, log, debug, error, toMoney } from 'chakaa/lib/functions.js';

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
	if(nservers<2)budget*=3.33;
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
}