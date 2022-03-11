//Do handle any hacknet stuff
import { HACKNET_TIME_BETWEEN_BUYS } from 'chakaa/lib/config.js';
import { info, log, debug, toMoney, niceNumberDisplay } from 'chakaa/lib/functions.js';

export async function upgradeHacknet(ns, budget, did_upgrade=false) {
    debug(ns,`UpgradeHacknet(budget=${toMoney(budget)})`);
    let nodes = [];
    for(let i=0;i<ns.hacknet.numNodes();i++){
        let node = { id:i, cost:Infinity };
        let stats = [ "Level", "Ram", "Core", "Cache" ];
        for (const stat of stats) {
            let cost = ns.hacknet["get"+stat+"UpgradeCost"](i, 1);
            if(cost<node.cost){
                node.cost = cost;
                node.upgrade = stat;
            }
        }
        nodes.push(node);
    }
    nodes.sort((a,b) => (a.cost > b.cost) ? 1 : ((b.cost > a.cost) ? -1 : 0));
    let node = nodes[0];
    if(node && node.upgrade && node.cost<budget){
        ns.hacknet["upgrade"+node.upgrade]( node.id, 1 );
        return upgradeHacknet(ns, budget - node.cost, true);
    }
    return did_upgrade;
}

// TODO: this should buy nodes based on how much money *all* nodes have made since
// the last upgrade/node purchase.
export async function buyNewHacknet(ns, budget) {
    // Make it more reluctant to buy more nodes the more nodes we have.
    let nhacknets = ns.hacknet.numNodes();
    // budget = budget / (1 + nhacknets);
    debug(ns,`BuyNewHacknet(budget=${toMoney(budget)})`);
    let cost = ns.hacknet.getPurchaseNodeCost();
    if(cost > budget) return false;
    info(ns,`Buying hacknet-node-${nhacknets} for ${toMoney(cost)}`);
    ns.hacknet.purchaseNode();
    return true;
}

let last_hashes = 0;
// Spend all hashes
export async function spendHashes(ns, budget) {
    //Figure out how many hashes we produced since last time we spent them, and how fast we're producing new hashes.
    let rate = 0;
    for(let i=0;i<ns.hacknet.numNodes();i++){
        rate = rate + ns.hacknet.getNodeStats(i).production
    }

    //Based on hash production rate, figure out how many we're willing to spend
    //on money that can be folded back into the hacknet network.
    //We want this to be 100% if we're producing less than one hash per second,
    //gradually dropping off past that.
    let hash_budget = ns.hacknet.numHashes() / Math.log(Math.max(2,rate), 2)
    debug(ns,`prd=${niceNumberDisplay(ns.hacknet.numHashes() - last_hashes,"","h")}, rate=${niceNumberDisplay(rate,"","h/s")}, hash_budget=${niceNumberDisplay(hash_budget,"","h")}`);

    let fullHashActions=["Generate Coding Contract"];
    for (const hashAction of fullHashActions) {
        while(ns.hacknet.hashCost(hashAction)<ns.hacknet.numHashes()){
            ns.hacknet.spendHashes(hashAction);
            hash_budget = hash_budget - ns.hacknet.hashCost(hashAction)
        }
    }
    let budgetHashActions=["Sell for Money"];
    for (const hashAction of budgetHashActions) {
        while(ns.hacknet.hashCost(hashAction)<hash_budget){
            ns.hacknet.spendHashes(hashAction);
            hash_budget = hash_budget - ns.hacknet.hashCost(hashAction)
        }
    }
    last_hashes = ns.hacknet.numHashes();
  return false
}

const actions = [
  [spendHashes, 1.0],
  [buyNewHacknet, 0.5],
  [upgradeHacknet, 0.1]
];

/** @param {NS} ns **/
export async function main(ns) {
  	ns.disableLog("ALL");
    while(true){
        let money = ns.getServerMoneyAvailable('home')
        for (const action of actions) {
            let ret = await action[0](ns,money*action[1]);
            if(ret)break;
        }
        await ns.sleep(HACKNET_TIME_BETWEEN_BUYS);
    }
}