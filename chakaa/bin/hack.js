/**
 * A small script to hack a server.
 */

/** @param {NS} ns **/
export async function main(ns) {
    const target = ns.args[1] || ns.getHostname();
    await ns.hack(target)
  }