




/** @param {NS} ns **/
export async function main(ns) {
    let thisDiv = ns.corporation.getDivision("LaFumetteCestChouette");
    let currentDivReasearch = thisDiv.research;
    let haveLab = thisDiv.upgrades.includes("Hi-Tech R&D Laboratory");
    let haveMTA1 = thisDiv.upgrades.includes("Market-TA.I");
    let haveMTA2 = thisDiv.upgrades.includes("Market-TA.II");
    ns.tprint(thisDiv.upgrades);
  }