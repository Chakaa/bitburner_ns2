const SCRIPTS = [
    'chakaa.bin.grow.js',
    'chakaa.bin.hack.js',
    'chakaa.bin.weaken.js',
  ];

const joinPath = (...parts) => parts.join('/');

const baseUrl = "https://raw.githubusercontent.com"
const user = "Chakaa"
const repo = "bitburner_ns2"
const branch = "main"

/** @param {NS} ns **/
export async function main(ns) {

  for (const script of SCRIPTS) {
    const url = joinPath(baseUrl, user, repo, branch, script);

    ns.tprint(`Downloading ${script}`);
    const success = await ns.wget(url, script);

    if (!success) {
      ns.tprint(`Unable to download script from url: ${url}`);
    }

    // Wait a little while to give the RAM calculations some time
    // to finish.
    // await ns.sleep(1000);
  }

  ns.tprint('Botnet deployed');
}