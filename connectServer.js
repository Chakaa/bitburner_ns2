import { connectToServer } from './chakaa.lib.functions.js';

/** @param {NS} ns **/
export async function main(ns) {
	let startServer = ns.getHostname();
	let target = ns.args[0];
	if (target === undefined) {
		ns.alert('Please provide target server');
		return;
	}
	connectToServer(ns,startServer,target);
}