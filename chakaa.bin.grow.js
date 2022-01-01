/**
 * A *very basic* script for growing a host. test
 */
/** @param {NS} ns **/

export async function main(ns) {
    const hosts = ns.args[0] || ns.getHostname();

    while (true) {
        await ns.grow(hosts);
    }
}