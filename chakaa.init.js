import { DELAY_BETWEEN_CHECKS,RESERVED_RAM,UNIS } from './chakaa.lib.config.js';
import { info } from './chakaa.lib.functions.js';

// Setup daemon for stuff that needs to be initialized on page load, and
// stuff that should be kept running at all time.
// The programs in `daemons` are started in the order they are listed; if it
// doesn't have enough free RAM on home to start one of them, it waits until
// it does rather than skipping it and trying the next one.

const daemons = [
  "chakaa.run.opsManager.js", //Start the OPS manager
  "chakaa.run.hacknetManager.js", // This isn't all that useful, but it is very inexpensive and will fit in the starting 32GB when the other two won't.
  "chakaa.run.serversManager.js", // Prefer increasing available processing power
  "chakaa.run.codingContractsManager.js", // Then solve the ccts
  "chakaa.run.upgradesManager.js", //Handle computer upgrades, only if we have singularity
  "chakaa.run.wseManager.js", // Or play with the market
  //"chakaa.run.factionManager.js", // then work for factions
  //"chakaa.run.activityManager.js", // Or perform activities
  //"chakaa.run.gangsManager.js", // Or manage gangs
];

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");
  while(ns.getPlayer().hacking<10){
    ns.universityCourse(UNIS[ns.getPlayer().city][0],"Study Computer Science");
    await ns.sleep(5000)
  }
  ns.stopAction();

  while (true) {
    for (const daemon of daemons) {
      let mem_total = ns.getServerMaxRam("home");
      let mem_used = ns.getServerUsedRam("home");
      const mem_free = mem_total - mem_used - (mem_total <= 32 ? 0 : RESERVED_RAM);
      if (ns.isRunning(daemon, ns.getHostname())) continue;
      if (ns.getScriptRam(daemon) > mem_free) break;
      info(ns, `Launching daemon ${daemon}`);
      await ns.run(daemon);
    }
    await ns.sleep(DELAY_BETWEEN_CHECKS * 1000);
  }
}

/*
TEMP STUFF

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
*/