/**
 * Script for handling augs stuff
 */

export const prios = {
  "hacknet": 1,
  "hack": 2,
  "sociacorp": 1,
  "useless": -1,
  "social": 1,
  "combat": 0,
  "bladeburner": 1,
  "special": 3,
  "superspecial": 5,
}
export const sub_prios = {
  "truc": 1
}

export const augs = {
  "Hacknet Node CPU Architecture Neural-Upload": {type:'hacknet', stype:"truc"}
  ,"Hacknet Node Cache Architecture Neural-Upload": {type:'hacknet', stype:"truc"}
  ,"Hacknet Node NIC Architecture Neural-Upload": {type:'hacknet', stype:"truc"}
  ,"Hacknet Node Kernel Architecture Neural-Upload": {type:'hacknet', stype:"truc"}
  ,"Hacknet Node Core Architecture Neural-Upload": {type:'hacknet', stype:"truc"}
  ,"Hacknet Node Kernel Direct-Neural Interface": {type:'hacknet', stype:"truc"}
  ,"Hacknet Node Core Direct-Neural Interface": {type:'hacknet', stype:"truc"}

  ,"BitRunners Neurolink": {type:'superspecial', stype:"truc"}
  ,"CashRoot Starter Kit": {type:'superspecial', stype:"truc"}
  ,"PCMatrix": {type:'superspecial', stype:"truc" }
  ,"Neuralstimulator": {type:'hack', stype:"truc"}
  ,"CRTX42-AA Gene Modification": {type:'hack', stype:"truc"}
  ,"Neuregen Gene Modification": {type:'hack', stype:"truc"}
  ,"BitWire": {type:'hack', stype:"truc"}
  ,"Artificial Bio-neural Network Implant": {type:'hack', stype:"truc"}
  ,"Artificial Synaptic Potentiation": {type:'hack', stype:"truc"}
  ,"Enhanced Myelin Sheathing": {type:'hack', stype:"truc"}
  ,"Synaptic Enhancement Implant": {type:'hack', stype:"truc"}
  ,"Neural-Retention Enhancement": {type:'hack', stype:"truc"}
  ,"DataJack": {type:'hack', stype:"truc"}
  ,"Embedded Netburner Module": {type:'hack', stype:"truc"}
  ,"Embedded Netburner Module Core Implant": {type:'hack', stype:"truc"}
  ,"Embedded Netburner Module Core V2 Upgrade": {type:'hack', stype:"truc"}
  ,"Embedded Netburner Module Core V3 Upgrade": {type:'hack', stype:"truc"}
  ,"Embedded Netburner Module Analyze Engine": {type:'hack', stype:"truc"}
  ,"Embedded Netburner Module Direct Memory Access Upgrade": {type:'hack', stype:"truc"}
  ,"Neural Accelerator": {type:'hack', stype:"truc"}
  ,"Cranial Signal Processors - Gen I": {type:'hack', stype:"truc"}
  ,"Cranial Signal Processors - Gen II": {type:'hack', stype:"truc"}
  ,"Cranial Signal Processors - Gen III": {type:'hack', stype:"truc"}
  ,"Cranial Signal Processors - Gen IV": {type:'hack', stype:"truc"}
  ,"Cranial Signal Processors - Gen V": {type:'hack', stype:"truc"}
  ,"Neuronal Densification": {type:'hack', stype:"truc"}
  ,"PC Direct-Neural Interface": {type:'hack', stype:"truc"}
  ,"PC Direct-Neural Interface Optimization Submodule": {type:'hack', stype:"truc"}
  ,"PC Direct-Neural Interface NeuroNet Injector": {type:'hack', stype:"truc"}
  ,"HyperSight Corneal Implant": {type:'hack', stype:"truc"}
  ,"QLink": {type:'hack', stype:"truc"}
  ,"OmniTek InfoLoad": {type:'hack', stype:"truc"}
  ,"The Black Hand": {type:'hack', stype:"truc"}

  ,"Enhanced Social Interaction Implant": {type:'sociacorp', stype:"truc"}
  ,"Speech Processor Implant": {type:'sociacorp', stype:"truc"}
  ,"TITN-41 Gene-Modification Injection": {type:'sociacorp', stype:"truc"}
  ,"Nuoptimal Nootropic Injector Implant": {type:'sociacorp', stype:"truc"}
  ,"Speech Enhancement": {type:'sociacorp', stype:"truc"}
  ,"FocusWire": {type:'sociacorp', stype:"truc"}

  ,"ADR-V1 Pheromone Gene": {type:'social',stype:"truc"}
  ,"ADR-V2 Pheromone Gene": {type:'social',stype:"truc"}
  ,"SmartJaw": {type:'social', stype:"truc"}
  ,"Social Negotiation Assistant (S.N.A)": {type:'social', stype:"truc"}
  ,"The Shadow's Simulacrum": {type:'social', stype:"truc"}

  ,"Augmented Targeting I": {type:'combat', stype:"truc"}
  ,"Augmented Targeting II": {type:'combat', stype:"truc"}
  ,"Augmented Targeting III": {type:'combat', stype:"truc"}
  ,"Synthetic Heart": {type:'combat', stype:"truc"}
  ,"Synfibril Muscle": {type:'combat', stype:"truc"}
  ,"Combat Rib I": {type:'combat', stype:"truc"}
  ,"Combat Rib II": {type:'combat', stype:"truc"}
  ,"Combat Rib III": {type:'combat', stype:"truc"}
  ,"Nanofiber Weave": {type:'combat', stype:"truc"}
  ,"NEMEAN Subdermal Weave": {type:'combat', stype:"truc"}
  ,"Wired Reflexes": {type:'combat', stype:"truc"}
  ,"Graphene Bone Lacings": {type:'combat', stype:"truc"}
  ,"Bionic Spine": {type:'combat', stype:"truc"}
  ,"Bionic Arms": {type:'combat', stype:"truc"}
  ,"Graphene Bionic Spine Upgrade": {type:'combat', stype:"truc"}
  ,"Bionic Legs": {type:'combat', stype:"truc"}
  ,"Graphene Bionic Legs Upgrade": {type:'combat', stype:"truc"}
  ,"LuminCloaking-V1 Skin Implant": {type:'combat', stype:"truc"}
  ,"LuminCloaking-V2 Skin Implant": {type:'combat', stype:"truc"}
  ,"HemoRecirculator": {type:'combat', stype:"truc"}
  ,"SmartSonar Implant": {type:'combat', stype:"truc"}
  ,"CordiARC Fusion Reactor": {type:'combat', stype:"truc"}
  ,"Neotra": {type:'combat', stype:"truc"}
  ,"Photosynthetic Cells": {type:'combat', stype:"truc"}
  ,"NutriGen Implant": {type:'combat', stype:"truc"}
  ,"INFRARET Enhancement": {type:'combat', stype:"truc"}
  ,"DermaForce Particle Barrier": {type:'combat', stype:"truc"}
  ,"Graphene BranchiBlades Upgrade": {type:'combat', stype:"truc"}
  ,"Graphene Bionic Arms Upgrade": {type:'combat', stype:"truc"}
  ,"BrachiBlades": {type:'combat', stype:"truc"}
  ,"Hydroflame Left Arm": {type:'special', stype:"truc"} //Je sais pas ce que c'est -----A VERIFIER-----
  ,"Unstable Circadian Modulator": {type:'special', stype:"truc"} //Je sais pas ce que c'est -----A VERIFIER-----
  ,"Graphene BrachiBlades Upgrade": {type:'special', stype:"truc"} //Je sais pas ce que c'est -----A VERIFIER-----

  ,"EsperTech Bladeburner Eyewear": {type:'bladeburner', stype:"truc"}
  ,"EMS-4 Recombination": {type:'bladeburner', stype:"truc"}
  ,"ORION-MKIV Shoulder": {type:'bladeburner', stype:"truc"}
  ,"Hyperion Plasma Cannon V1": {type:'bladeburner', stype:"truc"}
  ,"Hyperion Plasma Cannon V2": {type:'bladeburner', stype:"truc"}
  ,"GOLEM Serum": {type:'bladeburner', stype:"truc"}
  ,"Vangelis Virus": {type:'bladeburner', stype:"truc"}
  ,"Vangelis Virus 3.0": {type:'bladeburner', stype:"truc"}
  ,"I.N.T.E.R.L.I.N.K.E.D": {type:'bladeburner', stype:"truc"}
  ,"Blade's Runners": {type:'bladeburner', stype:"truc"}
  ,"BLADE-51b Tesla Armor": {type:'bladeburner', stype:"truc"}
  ,"BLADE-51b Tesla Armor: Power Cells Upgrade": {type:'bladeburner', stype:"truc"}
  ,"BLADE-51b Tesla Armor: Energy Shielding Upgrade": {type:'bladeburner', stype:"truc"}
  ,"BLADE-51b Tesla Armor: Unibeam Upgrade": {type:'bladeburner', stype:"truc"}
  ,"BLADE-51b Tesla Armor: Omnibeam Upgrade": {type:'bladeburner', stype:"truc"}
  ,"BLADE-51b Tesla Armor: IPU Upgrade": {type:'bladeburner', stype:"truc"}
  ,"The Blade's Simulacrum": {type:'bladeburner', stype:"truc"}

  ,"NeuroFlux Governor": {type:'useless', stype:"truc"} // special cased in autofaction
  ,"The Red Pill": {type:'superspecial', stype:"truc"} //Prio because helps with the story
  ,"Neuroreceptor Management Implant": {type:'special', stype:"truc"} //Prio because helps multi-tasking
  ,"Neurotrainer I": {type:'special', stype:"truc"}
  ,"Neurotrainer II": {type:'special', stype:"truc"}
  ,"Neurotrainer III": {type:'special', stype:"truc"}
  ,"Power Recirculation Core": {type:'special', stype:"truc"}
  ,"SPTN-97 Gene Modification": {type:'special', stype:"truc"}
  ,"ECorp HVMind Implant": {type:'special', stype:"truc"}
  ,"Xanipher": {type:'special', stype:"truc"}
  ,"nextSENS Gene Modification": {type:'special', stype:"truc"}
}