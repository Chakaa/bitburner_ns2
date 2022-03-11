//Do handle any faction stuff
import { CORP_ACTION_LOOP, CORP_NAME, AGRI_NAME, TOBA_NAME } from '/chakaa/lib/config.js';
import { info, log, debug, error } from '/chakaa/lib/functions.js';

const cityList = ["Aevum", "Sector-12", "Chongqing", "Ishima", "New Tokyo", "Volhaven"];

//Check if all cities offices reached the expected limit for HC
export function allCitiesReachedHCLimit(ns,divname,limit){
  for (const city of cityList)
    if(ns.corporation.getOffice(divname, city).employees.length<limit)
      return false;

  return true;
}

//Check if we have enough upgrades
//upgrade_limit is, in order, [FocusWires,Neural Accelerators,Speech Processor Implants,Nuoptimal Nootropic Injector Implants,Smart Factories,Smart Storage,Wilson Analytics]
export function corpHasGivenUpgrades(ns,upgrade_limits){
  if(ns.corporation.getUpgradeLevel("FocusWires")<upgrade_limits[0]){ return false; }
  if(ns.corporation.getUpgradeLevel("Neural Accelerators")<upgrade_limits[1]){ return false; }
  if(ns.corporation.getUpgradeLevel("Speech Processor Implants")<upgrade_limits[2]){ return false; }
  if(ns.corporation.getUpgradeLevel("Nuoptimal Nootropic Injector Implants")<upgrade_limits[3]){ return false; }
  if(ns.corporation.getUpgradeLevel("Smart Factories")<upgrade_limits[4]){ return false; }
  if(ns.corporation.getUpgradeLevel("Smart Storage")<upgrade_limits[5]){ return false; }
  if(ns.corporation.getUpgradeLevel("Wilson Analytics")<upgrade_limits[6]){ return false; }
  return true;
}

//Check if all cities warehouses reached the expected limit for storage
export function allCitiesHaveEnoughWarehouse(ns,divname,limit){
  for (const city of cityList) {
    if(ns.corporation.hasWarehouse(divname, city)){
      if(ns.corporation.getWarehouse(divname, city).size<limit){
        return false;
      }
    }else{
      return false;
    }
  }
  return true;
}

//Check material stocks : material_limits needs to be [Hardware,Robots,AI Cores,Real Estate]
export function allCitiesHaveEnoughMaterials(ns,divname,material_limits){
  for (const city of cityList) {
    if(ns.corporation.getMaterial(divname,city,"Hardware").qty<material_limits[0]){ return false; }
    if(ns.corporation.getMaterial(divname,city,"Robots").qty<material_limits[1]){ return false; }
    if(ns.corporation.getMaterial(divname,city,"AI Cores").qty<material_limits[2]){ return false; }
    if(ns.corporation.getMaterial(divname,city,"Real Estate").qty<material_limits[3]){ return false; }
  }
  return true;
}

//Bring warehouse in city of divname up to the expected limit
export function improveWarehouseToLimit(ns,divname,city,limit){
  let cfunds = ns.corporation.getCorporation().funds;
  if(!ns.corporation.hasWarehouse(divname, city) && ns.corporation.getPurchaseWarehouseCost()<cfunds){
    ns.corporation.purchaseWarehouse(divname, city);
  }
  while(ns.corporation.hasWarehouse(divname, city) && ns.corporation.getWarehouse(divname, city).size<limit && ns.corporation.getUpgradeWarehouseCost(divname, city)<cfunds){
    ns.corporation.upgradeWarehouse(divname, city)
  }
}

//Bring HC in city office of divname up to the given limit
export function reachEmployeeLimit(ns,divname,city,limit){
  let cfunds = ns.corporation.getCorporation().funds;
  let employeeSize = ns.corporation.getOffice(divname,city).size;
  if(employeeSize<limit){
    if(ns.corporation.getOfficeSizeUpgradeCost(divname,city,limit-employeeSize)<cfunds){
      ns.corporation.upgradeOfficeSize(divname,city,limit-employeeSize)
    }else{
      return;
    }
  }

  while(ns.corporation.getOffice(divname, city).employees.length<limit){
    ns.corporation.hireEmployee(divname,city);
  }
}

//Retrieve a clean list of employee assignments
export function getOfficeEmployeeAssignment(ns,divname,city){
  let officeEmployeeAssignment = {"Operations":0,"Engineer":0,"Business":0,"Management":0,"Research & Development":0,"Training":0,"Unassigned":0};
  for(const e of ns.corporation.getOffice(divname,city).employees){
    let thisEmpJob = ns.corporation.getEmployee(divname,city,e).pos;
    officeEmployeeAssignment[thisEmpJob]++;
  }
  return officeEmployeeAssignment;
}

//Set all automatic job assignment to given values
export async function setAllAutoJobAssignment(ns,divname,city,job_limits){
  let jobLimitsSlots = {"Operations":job_limits[0],"Engineer":job_limits[1],"Business":job_limits[2],"Management":job_limits[3],"Research & Development":job_limits[4],"Training":job_limits[5]};
  let employeeAssignments = getOfficeEmployeeAssignment(ns,divname,city);
  for (const [key, value] of Object.entries(jobLimitsSlots)) {
    //Lower all where it is too much assigned (to free some people)
    if(employeeAssignments[key]>value){
      debug(ns,`Lowering ${key} in ${city} up to ${value}`);
      await ns.corporation.setAutoJobAssignment(divname,city,key,Math.floor(value));
    }
  }

  employeeAssignments = getOfficeEmployeeAssignment(ns,divname,city);
  for (const [key, value] of Object.entries(jobLimitsSlots)) {
    //Assign the correct value if not correct
    if(employeeAssignments[key]!=value){
      debug(ns,`Assigning ${key} in ${city} to ${value}`);
      await ns.corporation.setAutoJobAssignment(divname,city,key,Math.floor(value));
    }
  }
}

//Get material to limit in city warehouse for given divname
export async function buyMaterialToLimit(ns,divname,city,matName,limit){
  while(ns.corporation.getMaterial(divname,city,matName).qty<limit){
    ns.corporation.buyMaterial(divname,city,matName,(limit-ns.corporation.getMaterial(divname,city,matName).qty)/10);
    await ns.sleep(1000);
  }
  ns.corporation.buyMaterial(divname,city,matName,0);
}

//Get materials to limit in all cities warehouse for given divname
export async function smartBuyMaterialToLimit(ns,divname,limits){
  const targets = [
    ["Hardware", limits[0]]
    ,["Robots", limits[1]]
    ,["AI Cores", limits[2]]
    ,["Real Estate", limits[3]]
  ];
  
  let ongoing = true;
  while(ongoing){
      ongoing = false;
      for (const target of targets) {
          for (const city of cityList) {
              let thisQty = ns.corporation.getMaterial(divname,city,target[0]).qty;
              if(thisQty<target[1]){
                  ongoing = true;
                  debug(ns,`Buying [${(target[1]-thisQty)/10}] ${target[0]} in ${city}, because I have ${thisQty}`);
                  ns.corporation.buyMaterial(divname,city,target[0],(target[1]-thisQty)/10);
                  ns.corporation.sellMaterial(divname,city,target[0],0,1);
              }else if(thisQty>target[1]){
                  ongoing = true;
                  debug(ns,`Selling [${(thisQty-target[1])/10}] ${target[0]} in ${city}, because I have ${thisQty}`);
                  ns.corporation.sellMaterial(divname,city,target[0],(thisQty-target[1])/10,1);
                  ns.corporation.buyMaterial(divname,city,target[0],0);
              }else{
                  ns.corporation.buyMaterial(divname,city,target[0],0);
                  ns.corporation.sellMaterial(divname,city,target[0],0,1);
              }
            }
      }
    await ns.sleep(10);
  }

  for (const target of targets) {
      for (const city of cityList) {
          ns.corporation.buyMaterial(divname,city,target[0],0);
          ns.corporation.sellMaterial(divname,city,target[0],0,1);
        }
  }
}

//Get upgrade to a limit
export function improveUpgradeToLimit(ns,upgradeName,limit){
  if(ns.corporation.getUpgradeLevel(upgradeName)<limit && ns.corporation.getUpgradeLevelCost(upgradeName)<ns.corporation.getCorporation().funds){
    ns.corporation.levelUpgrade(upgradeName);
  }
}
//Get one upgrade
export function smartImproveUpgrade(ns,upgradeName){
  if(ns.corporation.getUpgradeLevelCost(upgradeName)<ns.corporation.getCorporation().funds){
    ns.corporation.levelUpgrade(upgradeName);
  }
}

//Get an unlock
export function smartGetUnlock(ns,upgradeName){
  if(ns.corporation.getUnlockUpgradeCost(upgradeName)<ns.corporation.getCorporation().funds){
    debug(ns,"Buying "+upgradeName);
    ns.corporation.unlockUpgrade(upgradeName)
  }
}

//Accept investment offer if matching condition
export function acceptInterestingInvestmentOffer(ns,round,amount){
  if(ns.corporation.getInvestmentOffer().round==round && ns.corporation.getInvestmentOffer().funds>=amount)
    ns.corporation.acceptInvestmentOffer();
}

//Check if any product development is in progress
export function isProductBeingProduced(ns,divname){
  for (const p of ns.corporation.getDivision(divname).products) {
    if(ns.corporation.getProduct(divname,p).developmentProgress<100)
      return true;
  }
  return false;
}

//If there are already 3 products, discontinue the oldest
export function discountinueOldestProduct(ns,divname,productPrefix){
  if(ns.corporation.getDivision(divname).products.length<3)
    return true;
  
  let min_productId = Infinity;
  for (const p of ns.corporation.getDivision(divname).products) {
    let id = parseInt(p.replace(productPrefix,""));
    if(id<min_productId)
      min_productId=id;
  }
  
  ns.corporation.discontinueProduct(divname,productPrefix+min_productId.toString());
}

//If there are already 3 products, discontinue the least performant
export function discountinueLeastPerformantProduct(ns,divname){
  if(ns.corporation.getDivision(divname).products.length<3)
    return true;
  let salePerf = Infinity;
  let leastPerfProduct = "";
  for (const p of ns.corporation.getDivision(divname).products) {
    let product = ns.corporation.getProduct(divname,p);
    leastPerfProduct = p;
  }
  ns.corporation.discontinueProduct(divname,leastPerfProduct);
}

//Create a new product in city with the given prefix
export function createNewProduct(ns,divname,city,productPrefix){
  let max_productId = 0;
  for (const p of ns.corporation.getDivision(divname).products) {
    let id = parseInt(p.replace(productPrefix,""));
    if(id>max_productId)
      max_productId=id;
  }
  max_productId+=1;
  let newProductName=productPrefix+max_productId.toString();
  
  discountinueOldestProduct(ns,divname,productPrefix);
  ns.corporation.makeProduct(divname,city,newProductName,1e9,1e9);
}

//Handle research optimally
export function manageDivisionResearch(ns,divname){
  return;
  //When Science > 10000, buy "Hi-Tech R&D Laboratory"
  //When Science > 140000, buy "Market-TA.I" and "Market-TA.II" at the same time
  let thisDiv = ns.corporation.getDivision(divname);
  let currentDivReasearch = thisDiv.research;
  let haveLab = thisDiv.upgrades.includes("Hi-Tech R&D Laboratory");
  let haveMTA1 = thisDiv.upgrades.includes("Market-TA.I");
  let haveMTA2 = thisDiv.upgrades.includes("Market-TA.II");

  if(!haveLab){
    if(currentDivReasearch>10000){
      ns.corporation.research(divname,"Hi-Tech R&D Laboratory");
    }
  }else if(!haveMTA2){
    if(!haveMTA1 && !haveMTA2){
      if(currentDivReasearch>140000){
        ns.corporation.research(divname,"Market-TA.I");
        ns.corporation.research(divname,"Market-TA.II");
      }
    }else if(haveMTA1 && !haveMTA2){
      ns.corporation.research(divname,"Market-TA.II");
    }
  }

}

//Set MTA2 if possible, or up and down the selling price
export function manageDivisionProducts(ns,divname){
  let gotMTA2 = ns.corporation.getDivision(divname).upgrades.includes("Market-TA.II");
  for (const p of ns.corporation.getDivision(divname).products) {
    if(ns.corporation.getProduct(divname,p).developmentProgress<100){
      continue;
    }
    if(gotMTA2){ // I have MTA2, activate it
      ns.corporation.setProductMarketTA2(divname,p,true);
      continue;
    }

    let product = ns.corporation.getProduct(divname,p);
    debug(ns,`Product ${p} sells for ${product.sCost}`)
    let old_ratio = product.sCost.toString().includes("MP")?parseInt(product.sCost.toString().replace("MP*","")):1; //??????????
    let new_ratio = old_ratio;

    for (const [key, value] of Object.entries(product.cityData)) {
      //value is [qty, prod, sell]
      if(value[1]>value[2]){
        new_ratio--;
        break;
      }
    }
    
    if(old_ratio==new_ratio){
      new_ratio++;
    }
    new_ratio = Math.max(1,new_ratio);

    ns.corporation.sellProduct(divname,"Aevum",p,"MAX","MP*"+new_ratio.toString(),true);
  }
}

export function getMaxProductMult(ns,divname){
  let bestMult = 1;
  for (const p of ns.corporation.getDivision(divname).products) {
    let productCost = ns.corporation.getProduct(divname,p).sCost.toString();
    if(productCost.includes("MP*")){
      let thisMult = parseInt(productCost.replace("MP*",""));
      if(thisMult>bestMult){
        bestMult=thisMult;
      }
    }
  }
  return bestMult;
}

//Set MTA2 if possible, or up and down the selling price
export function newManageDivisionProducts(ns,divname){
  if(ns.corporation.getCorporation().state=="PRODUCTION"){
    return;
  }
  let gotMTA2 = ns.corporation.getDivision(divname).upgrades.includes("Market-TA.II");
  for (const p of ns.corporation.getDivision(divname).products) {
    if(ns.corporation.getProduct(divname,p).developmentProgress<100){
      continue;
    }
    if(gotMTA2){ // I have MTA2, activate it
      ns.corporation.setProductMarketTA2(divname,p,true);
      continue;
    }

    let product = ns.corporation.getProduct(divname,p);
    if(!product.sCost.toString().includes("MP") || parseInt(product.sCost.toString().replace("MP*",""))==1){
      ns.corporation.sellProduct(divname,"Aevum",p,"MAX","MP*"+getMaxProductMult(ns,divname).toString(),true);
      return;
    }
    debug(ns,`Product ${p} sells for ${product.sCost}`);
    let old_ratio = product.sCost.toString().includes("MP")?parseInt(product.sCost.toString().replace("MP*","")):1; //??????????
    let new_ratio = old_ratio;
    let ini_ratio = old_ratio;

    for (const [key, value] of Object.entries(product.cityData)) {
      //value is [qty, prod, sell]
      if(value[1]>value[2]){
        new_ratio*=.9;
        break;
      }
    }
    
    if(old_ratio==new_ratio){
      new_ratio*=1.1;
    }
    new_ratio = Math.max(1,new_ratio);

    if(old_ratio==new_ratio){
      new_ratio=old_ratio+1;
    }

    ns.corporation.sellProduct(divname,"Aevum",p,"MAX","MP*"+Math.floor(new_ratio).toString(),true);
  }
}

export async function handleMyCorp(ns) {
  let nsc = ns.corporation;

  if(!ns.getPlayer().hasCorporation ){
    //Create corporation if it does not exist
    debug(ns,"Creating corporation");
    nsc.createCorporation(CORP_NAME,true);
    return;
  }

  let haveAgri = false;
  let haveToba = false;
  for (const div of nsc.getCorporation().divisions) {
    if(div.name==AGRI_NAME)haveAgri=true;
    if(div.name==TOBA_NAME)haveToba=true;
  }
  let corp = nsc.getCorporation(); //Retrieve this corporation

  //Before doing Agriculture stuff, we check Tobacco was not already purchased
  if(!haveToba){
    if(!haveAgri){
      //Create division if not exists
      debug(ns,"Buying Agriculture industry");
      nsc.expandIndustry("Agriculture", AGRI_NAME);
    }else if(!nsc.hasUnlockUpgrade("Smart Supply")){
      //Buy and activate Smart supply if we do not have it
      debug(ns,"Buying Smart Supply");
      smartGetUnlock(ns,"Smart Supply");
      await ns.sleep(2000);
      if(nsc.hasUnlockUpgrade("Smart Supply")){
        let cities = nsc.getDivision(AGRI_NAME).cities;
        for (const city of cities) {
          nsc.setSmartSupply(AGRI_NAME,city,true);
        }
      }
    }else if(!nsc.hasUnlockUpgrade("Warehouse API")){
      //Buy and activate Warehouse API if we do not have it
      debug(ns,"Buying Warehouse API");
      // smartGetUnlock(ns,"Warehouse API");
    }else if(nsc.getDivision(AGRI_NAME).cities.length<cityList.length){
      //Expand everywhere
      debug(ns,"Expanding to all cities");
      for (const city of cityList) {
        nsc.expandCity(AGRI_NAME,city);
      }
    }else if(nsc.hasUnlockUpgrade("Office API") && !allCitiesReachedHCLimit(ns,AGRI_NAME,3)){
      //If any city hasn't reach limit of 3 hires
      debug(ns,"Getting 3 employees in all cities");
      for (const city of cityList) {
        reachEmployeeLimit(ns,AGRI_NAME,city,3);
        await setAllAutoJobAssignment(ns,AGRI_NAME,city,[1,1,1,0,0,0]);
      }
    }
    //TODO : Set selling base items
    
    else if(nsc.hasUnlockUpgrade("Office API") && nsc.getHireAdVertCount(AGRI_NAME)<1){
      //Need to run my first ever AdVert
      debug(ns,"Getting first AdVert");
      if(nsc.getHireAdVertCost(AGRI_NAME)<corp.funds)
        nsc.hireAdVert(AGRI_NAME);
    }else if(!allCitiesHaveEnoughWarehouse(ns,AGRI_NAME,300)){
      //If any city has a smaller than 300 warehouse, or not at all, we buy it and upgrade
      debug(ns,"Upgrading all warehouses to 300");
      for (const city of cityList) {
        improveWarehouseToLimit(ns,AGRI_NAME,city,300);
      }
    }else if(!corpHasGivenUpgrades(ns,[1,0,0,0,0,0,0])){
      //Get upgrade to 1
      debug(ns,"Getting first FocusWires");
      improveUpgradeToLimit(ns,"FocusWires",1);
    }else if(!corpHasGivenUpgrades(ns,[0,1,0,0,0,0,0])){
      //Get upgrade to 1
      debug(ns,"Getting first Neural Accelerators");
      improveUpgradeToLimit(ns,"Neural Accelerators",1);
    }else if(!corpHasGivenUpgrades(ns,[0,0,1,0,0,0,0])){
      //Get upgrade to 1
      debug(ns,"Getting first Speech Processor Implants");
      improveUpgradeToLimit(ns,"Speech Processor Implants",1);
    }else if(!corpHasGivenUpgrades(ns,[0,0,0,1,0,0,0])){
      //Get upgrade to 1
      debug(ns,"Getting first Nuoptimal Nootropic Injector Implants");
      improveUpgradeToLimit(ns,"Nuoptimal Nootropic Injector Implants",1);
    }else if(!corpHasGivenUpgrades(ns,[0,0,0,0,1,0,0])){
      //Get upgrade to 1
      debug(ns,"Getting first Smart Factories");
      improveUpgradeToLimit(ns,"Smart Factories",1);
    }else if(!corpHasGivenUpgrades(ns,[2,0,0,0,0,0,0])){
      //Get upgrade to 2
      debug(ns,"Getting second FocusWires");
      improveUpgradeToLimit(ns,"FocusWires",2);
    }else if(!corpHasGivenUpgrades(ns,[0,2,0,0,0,0,0])){
      //Get upgrade to 2
      debug(ns,"Getting second Neural Accelerators");
      improveUpgradeToLimit(ns,"Neural Accelerators",2);
    }else if(!corpHasGivenUpgrades(ns,[0,0,2,0,0,0,0])){
      //Get upgrade to 2
      debug(ns,"Getting second Speech Processor Implants");
      improveUpgradeToLimit(ns,"Speech Processor Implants",2);
    }else if(!corpHasGivenUpgrades(ns,[0,0,0,2,0,0,0])){
      //Get upgrade to 2
      debug(ns,"Getting second Nuoptimal Nootropic Injector Implants");
      improveUpgradeToLimit(ns,"Nuoptimal Nootropic Injector Implants",2);
    }else if(!corpHasGivenUpgrades(ns,[0,0,0,0,2,0,0])){
      //Get upgrade to 2
      debug(ns,"Getting second Smart Factories");
      improveUpgradeToLimit(ns,"Smart Factories",2);
    }else if(!allCitiesHaveEnoughMaterials(ns,AGRI_NAME,[125,0,75,27000])){
      //If any city has not enough mats
      debug(ns,"Settingte correct amount of materials - Sp 1");
      await smartBuyMaterialToLimit(ns,AGRI_NAME,[125,0,75,27000]);
      // for (const city of cityList) {
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"Hardware",125); //12.5
      //   //await buyMaterialToLimit(ns,AGRI_NAME,city,"Robots",0); //0
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"AI Cores",75); //7.5
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"Real Estate",27000); //2700
      // }
    }else if(ns.corporation.getInvestmentOffer().round==1){
      //On round 1 of investment, accept if at least $210b
      debug(ns,"Getting my first 210b investment");
      acceptInterestingInvestmentOffer(ns,1,210e9)
    }else if(!nsc.hasUnlockUpgrade("Office API")){
      //Buy and activate Office API if we do not have it
      debug(ns,"Buying Office API");
      // smartGetUnlock(ns,"Office API");
    }else if(!allCitiesReachedHCLimit(ns,AGRI_NAME,9)){
      //If any city hasn't reach limit of 3 hires
      debug(ns,"Getting 9 employees in all cities");
      for (const city of cityList) {
        reachEmployeeLimit(ns,AGRI_NAME,city,9);
        await setAllAutoJobAssignment(ns,AGRI_NAME,city,[2,2,1,2,2,0]);
      }
    }else if(!corpHasGivenUpgrades(ns,[0,0,0,0,10,0,0])){
      //Get upgrade to 10
      debug(ns,"Getting 10 Smart Factories");
      improveUpgradeToLimit(ns,"Smart Factories",10);
    }else if(!corpHasGivenUpgrades(ns,[0,0,0,0,0,10,0])){
      //Get upgrade to 10
      debug(ns,"Getting 10 Smart Storage");
      improveUpgradeToLimit(ns,"Smart Storage",10);
    }else if(!allCitiesHaveEnoughWarehouse(ns,AGRI_NAME,2000)){
      //If any city has a smaller than 2000 warehouse, or not at all, we buy it and upgrade
      debug(ns,"Upgrading all warehouses to 2000");
      for (const city of cityList) {
        improveWarehouseToLimit(ns,AGRI_NAME,city,2000);
      }
    }else if(!allCitiesHaveEnoughMaterials(ns,AGRI_NAME,[2800,96,2520,146400])){
      //If any city has not enough mats
      debug(ns,"Setting correct amount of materials - Step 2");
      await smartBuyMaterialToLimit(ns,AGRI_NAME,[2800,96,2520,146400]);
      // for (const city of cityList) {
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"Hardware",2800); //267.5
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"Robots",96); //9.6
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"AI Cores",2520); //244.5
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"Real Estate",146400); //11940
      // }
    }else if(ns.corporation.getInvestmentOffer().round==2){
      //On round 2 of investment, accept if at least $4t
      debug(ns,"Getting second investment");
      acceptInterestingInvestmentOffer(ns,2,4e12)
    }else if(!allCitiesHaveEnoughWarehouse(ns,AGRI_NAME,3800)){
      //If any city has a smaller than 3800 warehouse, or not at all, we buy it and upgrade
      debug(ns,"Upgrading all warehouses to 3800");
      for (const city of cityList) {
        improveWarehouseToLimit(ns,AGRI_NAME,city,3800);
      }
    }else if(!allCitiesHaveEnoughMaterials(ns,AGRI_NAME,[9300,726,6270,230400])){
      //If any city has not enough mats
      debug(ns,"Setting correct amount of materials - Step 3");
      await smartBuyMaterialToLimit(ns,AGRI_NAME,[9300,726,6270,230400]);
      // for (const city of cityList) {
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"Hardware",9300); //650
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"Robots",726); //63
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"AI Cores",6270); //375
      //   await buyMaterialToLimit(ns,AGRI_NAME,city,"Real Estate",230400); //8400
      // }
    }
    else{
      //Create tobacco
      debug(ns,"Expanding to Tobacco industry");
      nsc.expandIndustry("Tobacco", TOBA_NAME);
    }
  }
  else{
    //I know I have developped to Tobacco <= NO ACTION
    
    //manageDivisionProducts(ns,TOBA_NAME); //Check my products are selling max with optimal MP*x, if we have "Market-TA.II", activate it
    newManageDivisionProducts(ns,TOBA_NAME);
    if(!isProductBeingProduced(ns,TOBA_NAME)){
      //Make sure there is a product being developped at all time
      debug(ns,"Starting producing new product");
      createNewProduct(ns,TOBA_NAME,"Aevum","Tobacco v");
    }
    manageDivisionResearch(ns,TOBA_NAME); //Get the researches if possible
    
    if(nsc.getDivision(TOBA_NAME).cities.length<cityList.length){
      //Expand to all cities
      debug(ns,"Expanding to all cities");
      for (const city of cityList) {
        nsc.expandCity(TOBA_NAME,city);
      }
    }else if(!allCitiesHaveEnoughWarehouse(ns,TOBA_NAME,0)){
      //If any city has no warehouse, get it
      debug(ns,"Getting a warehouse in every city");
      for (const city of cityList) {
        improveWarehouseToLimit(ns,TOBA_NAME,city,0);
      }
    }else if(nsc.getOffice(TOBA_NAME, "Aevum").employees.length<30){
      //In Aevum, get 30 employees as 6,6,6,6,6,0
      debug(ns,"Getting enough employees in Aevum - Step 1");
      reachEmployeeLimit(ns,TOBA_NAME,"Aevum",30);
      await setAllAutoJobAssignment(ns,TOBA_NAME,"Aevum",[6,6,6,6,6,0]);
    }else if(!allCitiesReachedHCLimit(ns,TOBA_NAME,9)){
      //In other cities, get 9 employees as 2,2,1,2,2,0
      debug(ns,"Getting enough employees in other cities than Aevum - Step 1");
      for (const city of cityList) {
        if(city=="Aevum")continue;
        reachEmployeeLimit(ns,TOBA_NAME,city,9);
        await setAllAutoJobAssignment(ns,TOBA_NAME,city,[2,2,1,2,2,0]);
      }
    }else if(!corpHasGivenUpgrades(ns,[20,20,20,20,0,0,14]) || nsc.getDivision(TOBA_NAME).awareness<36000 ){ 
      //Now a 3 items prios
        //Wilson Analytics to 14 if >$3t
        //FocusWires, Neural Accelerators, Speech Processor Implants, and Nuoptimal Nootropic Injector Implants to 20
        //AdVert if Awareness <36k
      debug(ns,"Getting more upgrades");
      improveUpgradeToLimit(ns,"Wilson Analytics",14);
      improveUpgradeToLimit(ns,"FocusWires",20);
      improveUpgradeToLimit(ns,"Neural Accelerators",20);
      improveUpgradeToLimit(ns,"Speech Processor Implants",20);
      improveUpgradeToLimit(ns,"Nuoptimal Nootropic Injector Implants",20);
      if(nsc.getDivision(TOBA_NAME).awareness<36000 && nsc.getHireAdVertCost(TOBA_NAME)<corp.funds){
        nsc.hireAdVert(TOBA_NAME);
      }
    }else if(nsc.getOffice(TOBA_NAME, "Aevum").employees.length<60){
      //In Aevum, get 60 employees as 12,12,12,12,12,0
      debug(ns,"Getting enough employees in Aevum - Step 2");
      reachEmployeeLimit(ns,TOBA_NAME,"Aevum",60);
      await setAllAutoJobAssignment(ns,TOBA_NAME,"Aevum",[12,12,12,12,12,0]);
    }else{
      //If not public and something, go public

      if(ns.corporation.getInvestmentOffer().round==3){
        //On round 2 of investment, accept if at least $700t
        debug(ns,"Getting third investment");
        acceptInterestingInvestmentOffer(ns,3,700e12);
      }
      if(!ns.corporation.getCorporation().public && ns.corporation.getInvestmentOffer().round==4 && nsc.getOffice(TOBA_NAME, "Aevum").size>190){
        //Lets go public now
        debug(ns,"Going public now");
        ns.corporation.goPublic(ns.corporation.getCorporation().numShares/2);
      }
      if(ns.corporation.getCorporation().public){
        ns.corporation.issueDividends(.4);
      }
      if(ns.corporation.getCorporation().public && !nsc.hasUnlockUpgrade("Shady Accounting")){
        //Buy and activate Shady Accounting if we do not have it
        smartGetUnlock(ns,"Shady Accounting");
        // return;
      }
      if(ns.corporation.getCorporation().public && !nsc.hasUnlockUpgrade("Government Partnership")){
        //Buy and activate Government Partnership if we do not have it
        smartGetUnlock(ns,"Government Partnership");
        // return;
      }

      //Now a 3 items prio
        //Buy Wilson Analytics when enough money
        //Cheaper out of +15 in Aevum, up to 300, or additional AdVert
        //Upgrade other cities +9 if Aevum +60 and cannot afford Aevum or AdVert
      debug(ns,"Perform the 3 options optimization");
      
      smartImproveUpgrade(ns,"Wilson Analytics");
      let targetHC = Math.max(Math.floor((nsc.getOffice(TOBA_NAME, "Aevum").size-60)/9)*9,0);
      if(Math.min(nsc.getHireAdVertCost(TOBA_NAME),nsc.getOfficeSizeUpgradeCost(TOBA_NAME,"Aevum",15))<corp.funds){
        if(nsc.getHireAdVertCost(TOBA_NAME)<nsc.getOfficeSizeUpgradeCost(TOBA_NAME,"Aevum",15)){
          debug(ns,"Get one AdVert");
          nsc.hireAdVert(TOBA_NAME);
        }else{
          debug(ns,"Get more Aevum employees");
          let aevumSize = nsc.getOffice(TOBA_NAME, "Aevum").size+15;
          reachEmployeeLimit(ns,TOBA_NAME,"Aevum",aevumSize);
        }
      }else if(!allCitiesReachedHCLimit(ns,TOBA_NAME,targetHC)){
        debug(ns,`Get more non-Aevum employees, up to ${targetHC}`);
        for (const city of cityList) {
          if(city=="Aevum")continue;
          reachEmployeeLimit(ns,TOBA_NAME,city,targetHC);
        }
      }
      
      //Correctly set autojob assignment
      for (const city of cityList) {
        let employeeSize = nsc.getOffice(TOBA_NAME, city).size;
        let cityRatio = (city=="Aevum")?[Math.floor(employeeSize/5),Math.floor(employeeSize/5),Math.floor(employeeSize/5),Math.floor(employeeSize/5),Math.floor(employeeSize/5),0]:[Math.floor(2*employeeSize/9),Math.floor(2*employeeSize/9),Math.floor(1*employeeSize/9),Math.floor(2*employeeSize/9),Math.floor(2*employeeSize/9),0];
        await setAllAutoJobAssignment(ns,TOBA_NAME,city,cityRatio);
      }
    }
  }
}

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");
  while(true){
    await handleMyCorp(ns);
    await ns.sleep(CORP_ACTION_LOOP);
  }
}