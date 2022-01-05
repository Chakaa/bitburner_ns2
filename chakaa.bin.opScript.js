/**
 * A small script to do whatever on a server.
 */

/** @param {NS} ns **/
export async function main(ns) {
    const op = ns.args[0] || "hack";
    const target = ns.args[1] || ns.getHostname();
  
    if(op=="hack"){
      return ns.hack(target)
    }else if(op=="grow"){
      return ns.grow(target)
    }else if(op=="weaken"){
      return ns.weaken(target)
    }else{
      await ns.sleep(10);
      return false;
    }
  }