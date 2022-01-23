import { factionNames } from '/chakaa/lib/factions.js';

export function getFactionStatus(ns){
    let out = ""
    for (const [key, value] of Object.entries(factionNames)) {
      let r = Math.floor(ns.getFactionRep(key));
      let f = Math.floor(ns.getFactionFavor(key));
      let augs = ns.getAugmentationsFromFaction(key);
      let aa = augs.length;
      let ba = 0;
      for(let i=0;i<augs.length;i++){
        ba += ns.getOwnedAugmentations(true).includes(augs[i])?1:0;
      }
      let comp = Math.floor(100*ba/aa);
  
      out += `[${comp.toString().padStart(3,'0')}%] ${key} [${r} reputs/${f} favor]\n`
    }
    return out;
  }

/** @param {NS} ns **/
export async function main(ns) {
    ns.alert(getFactionStatus(ns))
  }