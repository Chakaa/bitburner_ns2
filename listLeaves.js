const findPath = (ns, serverName, serverList, ignore) => {
	ignore.push(serverName);
	let scanResults = ns.scan(serverName);
    if(scanResults.length==1){
        ns.tprint(serverList.join('>'));
        return;
    }
	for (let server of scanResults) {
		if (ignore.includes(server)) {
			continue;
		}
		serverList.push(server);
		findPath(ns, server, serverList, ignore);
		serverList.pop();
	}
	return [serverList, false];
}


/** @param {NS} ns **/
export async function main(ns) {
	findPath(ns, ns.getHostname(), [], []);
}