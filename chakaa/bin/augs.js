//Do what is necessary to restart
import { START_SCRIPT } from '/chakaa/lib/config.js';
import { factionNames } from '/chakaa/lib/factions.js';
import { info, log, debug, error } from '/chakaa/lib/functions.js';
import { augs,prios } from '/chakaa/lib/augs.js';

const kill_procs = true;
const sell_stocks = true;
const buy_better_augs = true;
const finish_nfg = true;

//Get faction with currently more reput
function getMaxReputFaction(ns){
    let rep = 0;
    let target = null;
    for (const [key, value] of Object.entries(factionNames)) {
      let thisRep = ns.getFactionRep(key);
      if(thisRep>rep && key!="Bladeburners"){
        rep=thisRep;
        target=key;
      }
    }
  
    return target;
  }

//Perform pre-reset operations
function prepareReset(ns){
    // Kill running scripts
    if(kill_procs){
        debug(ns,"Killing scripts");
        const kills = [
            "/chakaa/init.js", //prioritize ram acquisition
            "/chakaa/run/ramManager.js", //prioritize ram acquisition
            "/chakaa/run/serversManager.js", // Prefer increasing available processing power
            "/chakaa/run/hacknetManager.js", // This isn't all that useful, but it is very inexpensive and will fit in the starting 32GB when the other two won't.
            "/chakaa/run/programManager.js", //Handle program buying and creation
            "/chakaa/run/wseManager.js", // Or play with the market
            // "chakaa/run/activityManager.js", // Or perform activities
            // "chakaa/run/gangsManager.js", // Or manage gangs
        ];
        for (const kill of kills) {
            if (ns.isRunning(kill, ns.getHostname())){
                ns.kill(kill, ns.getHostname());
            }
        }
    }
  
    // Sell all portfolio now
    if(sell_stocks){
        debug(ns,"Selling portfolio");
        try{
            for (const symbol of ns.stock.getSymbols()) {
                const [shares, avgPx, sharesShort, avgPxShort] = ns.stock.getPosition(symbol);
                if(shares>0){
                ns.stock.sell(symbol, shares);
                }
            }
        }catch(e){ debug(ns,"Issue selling stocks. No WSE API yet ?") }
    }
    
    // //Buy all available augments
    if(buy_better_augs){
        debug(ns,"Buying max augments");
        try{
            let faction_augs = [];
            let curr_money = ns.getServerMoneyAvailable('home');
        
            for (const [key, value] of Object.entries(factionNames)) {
                let single_faction_augs = ns.getAugmentationsFromFaction(key);
        
                for (const aug of single_faction_augs) {
                let aug_rep = ns.getAugmentationRepReq(aug);
                let aug_pri = ns.getAugmentationPrice(aug);
                // debug(ns,`checking ${aug.name} on rep ${aug.rep} and price ${aug.price} from faction ${key}`)
                if( aug_rep <= ns.getFactionRep(key) && aug_pri <= curr_money && prios[augs[aug].type]>=0){
                    faction_augs.push( {faction:key, name:aug, rep:aug_rep, price: aug_pri, prio:prios[augs[aug].type]} );
                }
                }
            }
            
            faction_augs.sort((a,b) => (a.price > b.price || (a.price == b.price && a.prio > b.prio)) ? -1 : ((b.price > a.price || (a.price == b.price && b.prio > a.prio)) ? 1 : 0));
            let anythingBought = true;
            while(anythingBought){
                anythingBought = false;
                for (const aug of faction_augs) {
                    if(ns.purchaseAugmentation(aug.faction, aug.name))
                        anythingBought = true;
                }
            }
        }catch(e){ debug(ns,e) }
    }
  
    // //Buy max NFGs
    if(finish_nfg){
        debug(ns,"Buying max NFGs");
        try{
        let nfg_name = "NeuroFlux Governor";
        let faction = getMaxReputFaction(ns);
        while(ns.purchaseAugmentation(faction, nfg_name)){ }
        }catch(e){ debug(ns,"Issue buying loads of NFGs") }
    }
  }
  
/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    prepareReset(ns);
    ns.installAugmentations(START_SCRIPT);
  }