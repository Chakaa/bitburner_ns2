import { MONEY_FORMAT,INT_FORMAT,LEV_LOG,INF_LOG,LOG_LOG,DEB_LOG,ERR_LOG } from 'chakaa/lib/config.js';

/** @param {NS} ns **/
export async function info(ns,message) {
	if(INF_LOG==="terminal"){
		ns.tprint(message);
	}
	ns.print(message);
}
export async function log(ns,message) {
	if(LEV_LOG=="INF")return;
	if(LOG_LOG==="terminal"){
		ns.tprint(message);
	}
	ns.print(message);
}
export async function debug(ns,message) {
	if(LEV_LOG!="DEB")return;
	if(DEB_LOG==="terminal"){
		ns.tprint(message);
	}
	ns.print(message);
}
export async function error(ns,message) {
	if(ERR_LOG==="terminal"){
		ns.tprint(message);
	}
	ns.print(message);
}
export function toMoney(ns,value) {
	return ns.nFormat(value, MONEY_FORMAT);
}
export function toInt(ns,value) {
	return ns.nFormat(value, INT_FORMAT);
}

export async function walkOne(ns, fn, host, depth, seen){
  seen[host] = true;
  let outp = await fn(ns,host,depth);
  if(!outp) return;

  if(host.includes("hacknet-node") || host.includes("pserv")) return;
  let servers = ns.scan(host);
  for(let i=0;i<servers.length;i++){
    let peer = servers[i];
    if(!seen[peer]){
      await walkOne(ns, fn, peer, depth+1, seen)
    }
  }
}
// Traverse the net, starting at root, and call fn(hostname, depth, path...) on each
// host reachable from it. Depth is the number of hops away from root the given
// host is; it is 0 for root. Path is the path from this node back to the root,
// and can be reversed to get the path from the root to this node.
// The fn should return true if traversal should continue through that host,
// false to stop traversal.
export async function walk(ns, fn, root){
  return await walkOne(ns, fn, root, 0, {})
}

export function waitAllOf(ns,tasks){
  let ps = tasks
  return function(){
    for (const p of ps) {
      if(!p(ns))return false;
    }
    return true;
  }
}
export function haveHackingLevel(ns,hack){
  return function(){
    return ns.getHackingLevel() >= hack;
  }
}
export function canHack(ns,host){
  return function(){
    return ns.hasRootAccess(host)
       && ns.getServerRequiredHackingLevel(host) <= ns.getHackingLevel();
  }
}
export function haveInvite(ns,faction){
  return function(){
    return ns.checkFactionInvitations().includes(faction)
  }
}
export function haveMoney(ns,amount){
  return function(){
    return ns.getServerMoneyAvailable('home') > amount;
  }
}
export function haveHacknetLvls(ns,limit){
  return function(){
	return [...Array(ns.hacknet.numNodes()).keys()].reduce( (a, b) => a + ns.hacknet.getNodeStats(b).level, 0 )>=limit;
  }
}
export function haveHacknetRam(ns,limit){
  return function(){
	return [...Array(ns.hacknet.numNodes()).keys()].reduce( (a, b) => a + ns.hacknet.getNodeStats(b).ram, 0 )>=limit;
  }
}
export function haveHacknetCores(ns,limit){
  return function(){
	return [...Array(ns.hacknet.numNodes()).keys()].reduce( (a, b) => a + ns.hacknet.getNodeStats(b).cores, 0 )>=limit;
  }
}
export async function waitUntil(ns,p,delay=60000){
  while(!p()){
    await ns.sleep(delay);
  }
}
export function connectToServer(ns,source,server){
	let [results, isFound] = findPath(ns, server, source, [], [], false);
	
	if (!isFound) {
		error(ns,`Server ${server} not found!`);
		return false
	}
	for (const r of results) {
		ns.connect(r);
	}
	debug(ns,`Connected to ${server}.`);
	return true;
}
export async function manualBackdoor(ns, server) {
	let startServer = ns.getHostname();
	if(connectToServer(ns,startServer,server)){
		await ns.installBackdoor();
		log(ns,`Backdoor installed on ${server}`);
	}
	ns.connect(startServer);
}
export function findPath(ns, target, serverName, serverList, ignore, isFound){
	ignore.push(serverName);
	let scanResults = ns.scan(serverName);
	for (let server of scanResults) {
		if (ignore.includes(server)) {
			continue;
		}
		if (server === target) {
			serverList.push(server);
			return [serverList, true];
		}
		serverList.push(server);
		[serverList, isFound] = findPath(ns, target, server, serverList, ignore, isFound);
		if (isFound) {
			return [serverList, isFound];
		}
		serverList.pop();
	}
	return [serverList, false];
}
export function fuzzyCheck(fullString,partString) {
    let hay = fullString.toLowerCase(), i = 0, n = -1, l;
    let s = partString.toLowerCase();
    for (; l = s[i++] ;) if (!~(n = hay.indexOf(l, n + 1))) return false;
    return true;
};
export function fuzzyFindPath(ns, target, serverName, serverList, ignore, isFound){
	ignore.push(serverName);
	let scanResults = ns.scan(serverName);
	for (let server of scanResults) {
		if (ignore.includes(server)) {
			continue;
		}
		if (fuzzyCheck(server, target)) {
			serverList.push(server);
			return [serverList, true];
		}
		serverList.push(server);
		[serverList, isFound] = findPath(ns, target, server, serverList, ignore, isFound);
		if (isFound) {
			return [serverList, isFound];
		}
		serverList.pop();
	}
	return [serverList, false];
}