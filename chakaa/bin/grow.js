/**
 * A small script to grow a server.
 */

/** @param {NS} ns **/
export async function main(ns) {
    const target = ns.args[1] || ns.getHostname();
    await ns.grow(target)
  }