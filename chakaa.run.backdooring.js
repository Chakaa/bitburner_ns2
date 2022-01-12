import { walk, manualBackdoor } from './chakaa.lib.functions.js';

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");

  while(true){
    await backdoorServers(ns);
    await ns.sleep(15*1000); //wait 15s before checking any other backdooring
  }
}

// Scan a single host and return information about it.
export async function stat(ns, host) {
    let stat = {};
    stat.host = host;
    stat.root = ns.hasRootAccess(host);
    stat.hack_level = ns.getServerRequiredHackingLevel(host);
    stat.backdoored = ns.getServer(host).backdoorInstalled;
    return stat;
}

export async function backdoorServers(ns){
    const backdoorHost = async (ns,host) => {
        if(host=="home"){
            return true;
        }
        let info = await stat(ns, host);
        if(info.root && !info.backdoored && !info.host.includes("pserv")){
            if(info.hack_level <= ns.getHackingLevel()){
                try{ await manualBackdoor(ns,host); } catch(e){ ns.print(e) }
            }
            else{
                ns.print(`Too soon to backdoor ${host} : ${ns.getHackingLevel()}/${info.hack_level}`)
            }
        }
        return true;
    }
    await walk(ns, backdoorHost, ns.getHostname())
}