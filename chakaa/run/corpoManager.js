//Do handle any faction stuff
import { CORP_ACTION_LOOP, CORP_NAME, AGRI_NAME, TOBA_NAME } from '/chakaa/lib/config.js';
import { info, log, debug, error } from '/chakaa/lib/functions.js';

let cityList = ["Aevum", "Sector-12", "Chongqing", "Ishima", "New Tokyo", "Volhaven"];

export function handleAgriDivision(ns) {
  let nsc = ns.corporation;

  //Before doing Agriculture stuff, we check Tobacco was not already purchased
  if(!nsc.getDivision(TOBA_NAME)){
    let corp = nsc.getCorporation(); //Retrieve this corporation
    
    let lessThanThree = false; //First round of hiring
    let initialAdVert = nsc.getHireAdVertCount(AGRI_NAME)==0; //First round of hiring
    for (const city of cityList) {
      let thisCityHC = nsc.getOffice(AGRI_NAME, city).employees.length;
      if(thisCityHC<3){
        lessThanThree=true;
        break;
      }
    }
    let storageLessThreeHundreds = false; //check for small warehouses
    for (const city of cityList) {
      if(nsc.hasWarehouse(AGRI_NAME, city)){
        if(nsc.getWarehouse(AGRI_NAME, city).size<300){
          storageLessThreeHundreds=true;
          break;
        }
      }else{
        storageLessThreeHundreds=true;
        break;
      }
    }
  
    if(!ns.getPlayer().hasCorporation ){
      //Create corporation if it does not exist
      nsc.createCorporation(CORP_NAME,false);
    }else if(nsc.getDivision(AGRI_NAME)){
      //Create division if not exists
      nsc.expandIndustry("Agriculture", AGRI_NAME);
    }else if(!nsc.hasUnlockUpgrade("Smart Supply")){
      //Buy and activate Smart supply if we do not have it
      nsc.unlockUpgrade("Smart Supply");
      let cities = nsc.getDivision(AGRI_NAME).cities;
      for (const city of cities) {
        nsc.setSmartSupply(AGRI_NAME,city,true);
      }
    }else if(nsc.getDivision(AGRI_NAME).cities.lengt<cityList.length){
      //Expand everywhere
      for (const city of cityList) {
        nsc.expandCity(AGRI_NAME,city);
      }
    }else if(lessThanThree){
      //If any city has less than 3 employees, we cap it
      for (const city of cityList) {
        while(nsc.getOffice(AGRI_NAME, city).employees.length<3){
          nsc.hireEmployee(AGRI_NAME,city);
        }
        nsc.setAutoJobAssignment(AGRI_NAME,city,"Operations",1);
        nsc.setAutoJobAssignment(AGRI_NAME,city,"Engineer",1);
        nsc.setAutoJobAssignment(AGRI_NAME,city,"Business",1);
      }
    }else if(initialAdVert){
      //Need to run my first ever AdVert
      if(nsc.getHireAdVertCost(AGRI_NAME)<corp.funds)
        nsc.hireAdVert(AGRI_NAME);
    }else if(storageLessThreeHundreds){
      //If any city has a smaller than 300 warehouse, or not at all, we buy it and upgrade
      for (const city of cityList) {
        if(!nsc.hasWarehouse(AGRI_NAME, city)){
          if(nsc.getPurchaseWarehouseCost()<corp.funds){
            nsc.purchaseWarehouse(AGRI_NAME, city);
          }else{
            break;
          }
        }
  
        while(nsc.getWarehouse(AGRI_NAME, city).size<300 && nsc.getUpgradeWarehouseCost(AGRI_NAME, city)<corp.funds){
          nsc.upgradeWarehouse(AGRI_NAME, city)
        }
      }
    }
  }
}

export function handleTobaccoDivision(ns) {
  if(nsc.getDivision(TOBA_NAME)){
    nsc.expandIndustry("Tobacco", TOBA_NAME);
  }
}

const actions = [
  [createCorp, 1.0]
  ,[buyCores, 0.6]
];

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");
  while(true){
    let money = ns.getServerMoneyAvailable('home')
    for (const action of actions) {
      try{
        //log(ns,`Runnin function ${action[0].name}`)
        let ret = await action[0](ns, money*action[1]);
        if(ret)break;
      }catch(e){
        error(ns, e);
        continue;
      }
    }
    await ns.sleep(CORP_ACTION_LOOP);
  }
}