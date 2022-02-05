/**
 * Script listing all hardcoded configs
 */
//Overall config
export const MONEY_FORMAT = "$0.00a"; // Set money display format
export const INT_FORMAT = "0a"; // Set int display format

export const UNIS = {
	"Sector-12":["Rothman University"]
}

//Define how the log outputs
export const LEV_LOG = "DEB"; // ERR is always, but then DEB >> LOG >> INF
export const INF_LOG = "terminal";
export const DEB_LOG = "";
export const LOG_LOG = "";
export const ERR_LOG = "terminal";

//OPS config
export const HACK_RATIO = 0.1; // How much money we want to try to hack from a system each time we hack it.
export const MIN_MONEY_FOR_HACK = 2e6; // Server needs at least this much money before we even consider hacking it.
export const GROWTH_FACTOR = 2; // How much we try to grow each server between hacks.
export const MIN_SLEEP_TIME = 1000.0; // What the shortest time we're willing to sleep is. Small values can adversely affect performance once we have a very large swarm.
export const HOME_RAM_RESERVED = 256; // How much memory do we reserve on home for user scripts.
export const OPS_NAME = "chakaa.bin.opScript.js"; // OPS Script name
export const OPS_RAM = 2.05; // OPS Script RAM (need to find a way to calculate it, rather than hardcoded)
export const BKD_NAME = "chakaa.bin.installBackdoor.js"; // OPS Script name
export const BKD_RAM = 3.60; // OPS Script RAM (need to find a way to calculate it, rather than hardcoded)
export const G_NAME = "/chakaa/bin/grow.js"; // Grow Script name
export const H_NAME = "/chakaa/bin/hack.js"; // Grow Script name
export const W_NAME = "/chakaa/bin/weaken.js"; // Grow Script name
export const OP_RAM = 1.80; // Grow Script RAM
export const S_NAME = "/chakaa/bin/share.js"; // Share Script name
export const HACKNET_NODE_RATIO = 0.1 // Percentage of hacknet node used for hacking

//Init config
export const DELAY_BETWEEN_CHECKS = 60; // seconds
export const RESERVED_RAM = 10;

//Hacknet config
//export const HACKNET_COST_FACTOR = 2 // A hacknet node needs to produce (cost of upgrade * this) before we'll buy the next upgrade. Unused.
export const HACKNET_TIME_BETWEEN_BUYS = 5000.0 // Time to wait between checks.

//Servers config
export const RAM_MIN = 8 // Smallest server we can buy
//export const RAM_MAX = 2^20 // Biggest server we can buy
export const RAM_MAX = 1024 // Biggest server we can buy
export const SERVER_TIME_BETWEEN_BUYS = 5000.0 // Time to wait between checks.

//Upgrades config
export const SPIKES = [ "BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe" ]; // hacking programs
export const UTILS = [ "AutoLink.exe", "DeepscanV1.exe", "DeepscanV2.exe", "ServerProfiler.exe" ]; // utilities programs
export const MAX_RAM = 256 // max ram to focus on, after that we buy when not expensive
export const UPGRADES_TIME_BETWEEN_BUYS = 5000.0 // Time to wait between checks.
//export const BUDGET = 0.9 // budget to invest. Unused

//Faction config
export const FACTION_WORK_LOOP_CHECK = 60000;
export const WORK_ORDER = ["hacking","hacking contracts","hackingcontracts","field","fieldwork","field work","security","securitywork","security work"];
export const AUGM_MIN_RESET = 6; //Min number of bought augments before resetting
export const START_SCRIPT = "/chakaa/init.js" //Starting script after reset

//acceptFactions config
export const ACCEPT_FACTION_LOOP_CHECK = 5*1000;
export const FACTION_INVITE_EXCLUSION = ["Sector-12","Chongqing","New Tokyo","Ishima","Aevum","Volhaven"];

//Corporation config
export const CORP_ACTION_LOOP = 2*1000;
export const CORP_NAME = "MyCorpo";
export const AGRI_NAME = "Agrifun";
export const TOBA_NAME = "LaFumetteCestChouette";
