
const targets = [
    ["Hardware", 2800]
    ,["Robots", 96]
    ,["AI Cores", 2520]
    ,["Real Estate", 146400]
  ];


//   const targets = [
//     ["Robots", 96]
//   ];

const cityList = ["Aevum", "Sector-12", "Chongqing", "Ishima", "New Tokyo", "Volhaven"];
//Set all automatic job assignment to given values
export async function setAllAutoJobAssignment(ns,divname,city,job_limits){
  await ns.corporation.setAutoJobAssignment(divname,city,"Operations",Math.floor(job_limits[0]));
  await ns.corporation.setAutoJobAssignment(divname,city,"Engineer",Math.floor(job_limits[1]));
  await ns.corporation.setAutoJobAssignment(divname,city,"Business",Math.floor(job_limits[2]));
  await ns.corporation.setAutoJobAssignment(divname,city,"Management",Math.floor(job_limits[3]));
  await ns.corporation.setAutoJobAssignment(divname,city,"Research & Development",Math.floor(job_limits[4]));
  await ns.corporation.setAutoJobAssignment(divname,city,"Training",Math.floor(job_limits[5]));
}


/** @param {NS} ns **/
export async function main(ns) {
    // ns.disableLog("ALL");
    let ongoing = true;
    let divname1 = "Agrifun";
    let divname2 = "LaFumetteCestChouette";
    // while(ongoing){
    //     ongoing = false;
    //     for (const target of targets) {
    //         for (const city of cityList) {
    //             let thisQty = ns.corporation.getMaterial(divname,city,target[0]).qty;
    //             if(thisQty<target[1]){
    //                 ongoing = true;
    //                 ns.tprint(`Buying [${(target[1]-thisQty)/10}] ${target[0]} in ${city}, because I have ${thisQty}`)
    //                 ns.corporation.buyMaterial(divname,city,target[0],(target[1]-thisQty)/10);
    //                 ns.corporation.sellMaterial(divname,city,target[0],0,1);
    //             }else if(thisQty>target[1]){
    //                 ongoing = true;
    //                 ns.tprint(`Selling [${(thisQty-target[1])/10}] ${target[0]} in ${city}, because I have ${thisQty}`);
    //                 ns.corporation.sellMaterial(divname,city,target[0],(thisQty-target[1])/10,1);
    //                 ns.corporation.buyMaterial(divname,city,target[0],0);
    //             }else{
    //                 ns.corporation.buyMaterial(divname,city,target[0],0);
    //                 ns.corporation.sellMaterial(divname,city,target[0],0,1);
    //             }
    //           }
    //     }
    //   await ns.sleep(10);
    // }
    // ns.tprint(`All Done`);

    // for (const target of targets) {
    //     for (const city of cityList) {
    //         ns.corporation.buyMaterial(divname,city,target[0],0);
    //         ns.corporation.sellMaterial(divname,city,target[0],0,1);
    //       }
    // }

    let emp_ratio = [6,6,6,6,6,0]
    await setAllAutoJobAssignment(ns,divname2,"Aevum",emp_ratio);


  }