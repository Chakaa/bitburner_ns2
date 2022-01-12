import { HACK_RATIO,OPS_NAME,OPS_RAM,BKD_NAME,BKD_RAM,HOME_RAM_RESERVED,MIN_MONEY_FOR_HACK,GROWTH_FACTOR,MIN_SLEEP_TIME } from './chakaa.lib.config.js';
import { info, log, error, debug, toMoney, toInt, walk, manualBackdoor } from './chakaa.lib.functions.js';

/**
 * Script managing all servers.
 * Truc truc
 */

const TARGET_MONEY = {}

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");
  //await scanHome(ns);

	while(true){
    let mapped = await mapNetwork(ns);
    let analyzed = await analyzeNetwork(ns,mapped[0],mapped[1]);
    let network = analyzed[0];
    let sleep = analyzed[1];
    let tasks = await generateTasks(ns,network);

    let min_time_val = await assignTasks(ns, network, tasks);
    sleep = Math.max(Math.min(sleep, min_time_val) + 500, MIN_SLEEP_TIME);
  
    //writeTSV("/run/shodan/network.txt", network, {"host", "max_threads", "threads", "weaken", "grow", "hack", "priority", "money", "max_money"})

    if(ns.args[0]=="once"){
      log(ns,`Would sleep for: ${toInt(ns,sleep/1000)}s, but breaking here because running once`);
      break;
    }else{
      if(sleep==Infinity){
        log(ns,"Sleep was infinite, resetting to 5 minutes");
        await ns.sleep(5*60000);
      }else{
        log(ns,`Sleeping for ${toInt(ns,sleep/1000)} seconds`);
        await ns.sleep(sleep);
      }
    }
  }
}

// Scan a single host and return information about it.
export async function stat(ns, host) {
	let stat = {};
	stat.host = host;
	stat.ps = ns.ps(host);
	stat.ls = ns.ls(host);
	stat.root = ns.hasRootAccess(host);
	stat.ports = ns.getServerNumPortsRequired(host);
	stat.ram = ns.getServerRam(host)[0];
	stat.ram_used = ns.getServerRam(host)[1];
	stat.security = ns.getServerSecurityLevel(host);
	stat.min_security = ns.getServerMinSecurityLevel(host);
	stat.money = ns.getServerMoneyAvailable(host);
	stat.max_money = ns.getServerMaxMoney(host);
	stat.hack_level = ns.getServerRequiredHackingLevel(host);
	stat.hack_fraction = ns.hackAnalyze(host);
	stat.hack_time = ns.getHackTime(host);
	stat.grow_time = ns.getGrowTime(host);
	stat.weaken_time = ns.getWeakenTime(host);
  return stat;
}

// We special-case home by reserving HOME_RAM_RESERVED memory on it for the user and allocating the rest to OPSs.
export async function scanHome(ns) {
	var info = await stat(ns, "home");
	info.max_threads = Math.floor(Math.max(0, info.ram - HOME_RAM_RESERVED)/OPS_RAM)
  info.threads = info.max_threads

  for (let i = 0; i < info.ps.length; i++) {
    let proc = info.ps[i]
    if(proc.filename == OPS_NAME){
      info.threads = info.threads - proc.threads
    }
  }

  return info
}

// Return a hostname => host_stat_t map with information about everything we can reach on the network.
export async function mapNetwork(ns) {
  let network = {};
  let swarm_size = 0;

  const scanHost = async (ns,host,depth) => {
    if (host=="home"){
      let info = await scanHome(ns)
      swarm_size = swarm_size + info.max_threads
      network[host] = info
      return true;
    }
    await tryPwn(ns,host);
    let info = await stat(ns, host);

    if(!info.root){
      info.max_threads = 0;
      info.threads = 0;
    }else{
      await installSPU(ns,info);
      info.max_threads = Math.floor(info.ram/OPS_RAM);
      info.threads = Math.floor((info.ram - info.ram_used)/OPS_RAM);
      swarm_size = swarm_size + info.max_threads;
    }
    await preTask(ns,info)
    network[host] = info
    return true
  };

  log(ns,`Performing full network scan.`);
  await walk(ns, scanHost, ns.getHostname())
  log(ns,`Network scan complete. ${swarm_size} threads available for SPUs.`);
  return [network,swarm_size]
}

// Appease the RAM checker (ns.brutessh() ns.ftpcrack() ns.relaysmtp() ns.httpworm() ns.sqlinject())
export async function tryPwn(ns,host) {
  if(ns.hasRootAccess(host)) return;
  debug(ns,`Trying to pwn ${host}`);
  let ports = ns.getServerNumPortsRequired(host);
  let hacks = ["brutessh", "ftpcrack", "relaysmtp", "httpworm", "sqlinject"];
  for (let i = 0; i < hacks.length; i++) {
    let hack = hacks[i]
    if(ns.fileExists(hack+".exe")){
      ns[hack](host)
      ports = ports - 1
    }
  }

  if(ports <= 0){
    ns.nuke(host)
    debug(ns,`Root access gained on ${host}`);
  }else{
    debug(ns,`Root access failed on ${host}`);
  }
}

// check if host is hackable
export function isHackable(ns,info) {
  return info.root && info.max_money > 0 && info.hack_level <= ns.getHackingLevel()
}
// check if host is backdoorable
// export function isBackdoorable(ns,info) {
//   return info.root && !info.host.includes("pserv") && info.hack_level <= ns.getHackingLevel() && !ns.getServer(info.host).backdoorInstalled;
// }

// Generate "pre-task" information about how much we want to weaken/hack/grow this host and how much money we want it to have.
export async function preTask(ns,info) {
  let host = info.host
  // if(isBackdoorable(ns,info)){
  //   try{
  //     await manualBackdoor(ns,host);
  //   }catch(e){ }
  // }
  if(isHackable(ns,info)){
    TARGET_MONEY[host] = TARGET_MONEY[host] || Math.min(Math.max(info.money,MIN_MONEY_FOR_HACK),info.max_money);
    info.hack_pending = 0;
    info.weaken_pending = 0;
    info.grow_pending = 0;
    info.weaken = Math.ceil((info.security - info.min_security) / 0.05);
    if(info.money > 0){
      info.grow = Math.ceil(Math.max(0, ns.growthAnalyze(host, Math.max(1.0, TARGET_MONEY[host]/info.money))));
    } else {
      // If the target has no money, only generate a "probing" grow to generate *some* money so that growthAnalyze will work the next time.
      info.grow = 1
    }
    info.hack = info.hack_fraction > 0 && info.money>=TARGET_MONEY[host]?Math.ceil(HACK_RATIO/info.hack_fraction):0

    log(ns,`${info.host} T=${info.threads} WGH ${info.weaken}/${info.grow}/${info.hack} ${toMoney(ns,info.money)}/${toMoney(ns,TARGET_MONEY[host])}`);
  } else {TARGET_MONEY[host] = null;/*log(ns,`${info.host} not hackable ????`);*/}
}

// let OPS_INSTALLED = {};
// export async function installSPU(ns,info) {
//   if(OPS_INSTALLED[info.host]) return
//   for (let i = 0; i < info.ls; i++) {
//     let file = info.ls[i]
//     if(file == OPS_NAME) return
//   }
//   await ns.scp(OPS_NAME, info.host)
//   OPS_INSTALLED[info.host] = true;
//   log(ns,`OPS software installed on ${info.host}`)
// }
export async function installSPU(ns,info) {
  if(ns.fileExists(OPS_NAME,info.host))
    return
  await ns.scp(OPS_NAME, info.host)
  log(ns,`OPS software installed on ${info.host}`)
}

// Generate ancillary data about the network that requires analyzing the whole network: the per-host priority and the pending tasks per target.
// Returns the annotated network map and the estimated time until the next currently running SPU task completes.
export async function analyzeNetwork(ns,network, swarm_size) {
  // First calculate priority based on the *desired* weaken/grow/hack
  // jobs in conjunction with the swarm size.
  for (const [host,info] of Object.entries(network)) {
    if(TARGET_MONEY[host]){
      info.priority = calcEfficiency(info, TARGET_MONEY[host], swarm_size)
      log(ns,`Calculating priority for ${host}: ${info.priority}`)
    }
  }

  // Then calculate how much we're doing already, and thus, how much we actually want to do.
  // Also, find existing tasks and figure out which ones will finish soonest.
  let next_task_completion = Infinity;
  for (const [host,info] of Object.entries(network)) {
    for (let i = 0; i < info.ps.length; i++) {
      let proc = info.ps[i]
      if(proc.filename == OPS_NAME){ 
        let task = proc.args[0];
        let target = proc.args[1];
        let time = parseInt(proc.args[2]);
        network[target][task+"_pending"] = network[target][task+"_pending"] + proc.threads
        next_task_completion = Math.min(next_task_completion, time)
      }
      
    }
  }

  return [network,Math.max(0, next_task_completion - ns.getTimeSinceLastAug()/1000)]
}


// Attempt to determine the priority (i.e money-per-time) of focusing hacks
// on this server.
// This is based on:
// - the per-hack money, based on the HACK_RATIO or the amount of money we'll hack
//   with one thread, whichever is more
// - the time it takes to hack it
// - the time it takes to execute all pending weaken tasks divided by the total
//   size of the swarm
// - the time it takes to execute all pending grow tasks, plus the time it takes
//   to execute the weaken tasks that would generate
export function calcEfficiency(info, target_money, swarm_size){
  return target_money * Math.max(info.hack_fraction, HACK_RATIO)
       / (info.hack_time * Math.ceil(info.hack/swarm_size)
          + info.weaken_time * (info.weaken + 0.004 * info.grow) * Math.ceil(info.weaken/swarm_size)
          + info.grow_time * info.grow * Math.ceil(info.grow/swarm_size))
}

//-- Task generation ----

// Return a sorted list of tasks, all of the form
// { host=foo, action=bar, threads=N, priority=P }
export async function generateTasks(ns, network){
  let tasks = []
  //ns.tprint(network);
  
  for (const [host,info] of Object.entries(network)) {
    await generateTasksForHost(ns,tasks, info)
  }

  // Sort the array
  tasks.sort((a,b) => (a.rank > b.rank) ? 1 : ((b.rank > a.rank) ? -1 : ((a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0))));
  
  return tasks;
}


export async function generateTasksForHost(ns,tasks, info){
  if(!TARGET_MONEY[info.host])return

  // Rank is more significant than priority when ordering.
  // We have these separate fields because it's hard to come up with a constant
  // factor we can modify priority by that will consistently give us the right
  // results no matter how weird the server money numbers get.
  let rank = 3
  let actions = ["weaken", "grow", "hack"];
  
  for(let i=0;i<actions.length;i++){
    let action = actions[i];
    if(info[action]>0){
      let task = { host:info.host, action:action, threads:info[action],
                     pending:Math.min(info[action+"_pending"], info[action]),
                     rank:rank, priority:info.priority, time:info[action+"_time"] };
      log(ns,`Task: ${task.action} ${task.host} (x${task.threads}) t=${task.time} P=${task.rank}/${task.priority}`)
      tasks.push(task)
      rank = rank - 1
    }
  }
  
  // Insert a "fallback" task for growing the host, ordered by how far each host
  // is away from its max money.
  let fallback_grow = Math.ceil(ns.growthAnalyze(info.host, info.max_money/(Math.max(info.money, 0.01)))) - info.grow;
  if(fallback_grow>0){
    let task = { host:info.host, action:"grow", threads:fallback_grow,
                    pending:Math.max(0, info.grow_pending - info.grow),
                    rank:0, priority:-fallback_grow, time:info.grow_time }
    log(ns,`Fallback: ${task.action} ${task.host} (x${task.threads}) t=${task.time} P=${task.rank}/${task.priority}`)
    tasks.push(task);
  }
}

//-- Task assignment ----

// Given a network of hosts we can possibly run SPUs on, and an ordered list of
// tasks, most important at the end, attempts to run SPUs to attack as many of
// the tasks as possible.
export async function assignTasks(ns,network, tasks){
  let idx = tasks.length-1;
  
  const next_task = () => {
    if(idx == 0)return null;
    let task = tasks[idx];
    idx = idx - 1;
    return task;
  };
  let task = next_task();
  let min_time = Infinity;

  for (const [host,info] of Object.entries(network)) {
    if(info.threads<=0 || !task)continue;
    //log(ns,`Scheduling task [${task.action} ${task.host}] on ${host} (${info.threads}/${info.max_threads} threads)`)
    while(task){
      if(info.threads <= 0)break; //next host
      if(task.pending >= task.threads){ //next task
        task = next_task();
        if(!task){
          //log(ns,`Ran out of tasks before running out of hosts! Even though there was ${tasks.length} tasks.`)
          break; // ran out of tasks before running out of hosts!
        }
        if(task.action=="hack")TARGET_MONEY[task.host] = Math.min(TARGET_MONEY[task.host] * GROWTH_FACTOR, network[task.host].max_money);
      }else{
        //log(ns,`Scheduling task ${task.action} ${task.host} [${task.threads}]`)
        let threads = Math.min(task.threads - task.pending, info.threads)
        runOPS(ns, host, threads, task.action, task.host, task.time)
        task.pending = task.pending + threads
        info.threads = info.threads - threads
        min_time = Math.min(min_time, task.time)
        log(ns,`Deployed OPS [${task.action} ${task.host}]×${threads} on ${host}, ${info.threads} threads left`)
      }
    }
  }
  
  //recordTaskState(tasks)
  return min_time
}

// run our OPS script
export function runOPS(ns, host, threads, action, target, time){
  //log(ns, `OPS: ${host}[${threads}]: ${action} ${target}`);
  ns.exec(OPS_NAME, host, threads, action, target, ns.getTimeSinceLastAug()/1000 + time)
}