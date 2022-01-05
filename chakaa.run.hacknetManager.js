//Do handle any hacknet stuff
import { HACKNET_TIME_BETWEEN_BUYS } from './chakaa.lib.config.js';
import { info, log, debug, toMoney } from './chakaa.lib.functions.js';

export async function upgradeHacknet(ns, budget, did_upgrade=false) {
    debug(ns,`UpgradeHacknet(budget=${budget})`);
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
    budget = budget / (1 + nhacknets);
    debug(ns,`BuyNewHacknet(budget=${budget})`);
    let cost = ns.hacknet.getPurchaseNodeCost();
    if(cost > budget) return false;
    info(ns,`Buying hacknet-node-${nhacknets} for ${toMoney(ns,cost)}`);
    ns.hacknet.purchaseNode();
    return true;
}

/*
local last_hashes = 0
local function spendHashes(budget)
  -- Figure out how many hashes we produced since last time we spent them, and
  -- how fast we're producing new hashes.
  local produced = ns.hacknet:numHashes() - last_hashes
  local rate = 0
  for i=0,ns.hacknet:numNodes()-1 do
    rate = rate + ns.hacknet:getNodeStats(i).production
  end
  log.info("spend hashes, prd=%.0f, rate=%.5f", produced, rate)
  -- Based on hash production rate, figure out how many we're willing to spend
  -- on money that can be folded back into the hacknet network.
  -- We want this to be 100% if we're producing less than one hash per second,
  -- gradually dropping off past that.
  local hash_budget = produced / math.log(math.max(2,rate), 2)
  log.info("hash_budget %f", hash_budget)
  while ns.hacknet:hashCost('Generate Coding Contract') < ns.hacknet:numHashes() do
    ns.hacknet:spendHashes('Generate Coding Contract')
    hash_budget = hash_budget - ns.hacknet:hashCost('Generate Coding Contract')
  end
  while ns.hacknet:hashCost('Sell for Money') < hash_budget do
    ns.hacknet:spendHashes('Sell for Money')
    hash_budget = hash_budget - ns.hacknet:hashCost('Sell for Money')
  end
  last_hashes = last_hashes:min(ns.hacknet:numHashes())
  return false
end
*/

const actions = [
  //[spendHashes, 1.0],
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

    //old stuff
    //await buildHacknetwork(ns);
    //while(true){
    //    await ns.sleep(60000);
    //    await buildHacknetwork(ns);
    //}
}
/*
export async function buildHacknetwork(ns) {
    let moneyPart = .01;
    let nodeLimit = 20;
    let hn = ns.hacknet;

    while(true){
        let allowedMoney = ns.getServerMoneyAvailable("home")*(hn.numNodes()<3?1:moneyPart);

        let index=-1;
        let kind = "";
        let minCost=Infinity;

        let newNodeCost = hn.getPurchaseNodeCost();

        for(let i=0;i<hn.numNodes();i++){
            let levelCost = hn.getLevelUpgradeCost(i, 1);
            let ramCost = hn.getRamUpgradeCost(i, 1);
            let coreCost = hn.getCoreUpgradeCost(i, 1);

            if(levelCost<allowedMoney && levelCost<minCost){
                index=i;
                kind="l";
                minCost=levelCost;
            }else if(ramCost<allowedMoney && ramCost<minCost){
                index=i;
                kind="r";
                minCost=ramCost;
            }else if(coreCost<allowedMoney && coreCost<minCost){
                index=i;
                kind="c";
                minCost=coreCost;
            }
        }
        switch(kind){
            case "l":
                hn.upgradeLevel(index,1);
                ns.print("Bought Level on index: "+index);
                break;
            case "r":
                hn.upgradeRam(index,1);
                ns.print("Bought RAM on index: "+index);
                break;
            case "c":
                hn.upgradeCore(index,1);
                ns.print("Bought Core on index: "+index);
                break;
            case "":
                if(newNodeCost<allowedMoney && hn.numNodes()<nodeLimit){
                    ns.print("Bought new node");
                    hn.purchaseNode();
                }else{
                    return;
                }
                break;
        }
        await ns.sleep(10);
    }
}
*/