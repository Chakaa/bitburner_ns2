/**
 * A *very basic* script for weakening a host.
 */
/** @param {NS} ns **/

export async function main(ns) {
    const host = ns.args[0] || ns.getHostname();

    while (true) {
        await ns.weaken(host);
    }
}