import { info, log, error, toMoney, toInt, walk, manualBackdoor } from './chakaa.lib.functions.js';

/** @param {NS} ns **/
export async function main(ns) {
	await ns.installBackdoor();
}