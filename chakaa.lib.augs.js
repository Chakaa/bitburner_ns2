/**
 * Script for handling augs stuff
 */

 export const type_priorities = {
  hacknet: 0,
  hack: 1,
  ['social/corp']: 0,
  social: 1,
  combat: 2,
  bladeburner: 0,
  special: 1,
}

export const augs = [
  [
     {type:'hacknet', tpriority:4, name:"Hacknet Node CPU Architecture Neural-Upload", priority:0}
    ,{type:'hacknet', tpriority:4, name:"Hacknet Node Cache Architecture Neural-Upload", priority:0}
    ,{type:'hacknet', tpriority:4, name:"Hacknet Node NIC Architecture Neural-Upload", priority:0}
    ,{type:'hacknet', tpriority:4, name:"Hacknet Node Kernel Architecture Neural-Upload", priority:0}
    ,{type:'hacknet', tpriority:4, name:"Hacknet Node Core Architecture Neural-Upload", priority:0}

    ,{type:'hack', tpriority:1, name:"BitRunners Neurolink", priority:10}
    ,{type:'hack', tpriority:1, name:"CashRoot Starter Kit", priority:10}
    ,{type:'hack', tpriority:1, name:"Neuralstimulator", priority:0}
    ,{type:'hack', tpriority:1, name:"CRTX42-AA Gene Modification", priority:1}
    ,{type:'hack', tpriority:1, name:"Neuregen Gene Modification", priority:2}
    ,{type:'hack', tpriority:1, name:"BitWire", priority:1}
    ,{type:'hack', tpriority:1, name:"Artificial Bio-neural Network Implant", priority:1}
    ,{type:'hack', tpriority:1, name:"Artificial Synaptic Potentiation", priority:1}
    ,{type:'hack', tpriority:1, name:"Enhanced Myelin Sheathing", priority:1}
    ,{type:'hack', tpriority:1, name:"Synaptic Enhancement Implant", priority:1}
    ,{type:'hack', tpriority:1, name:"Neural-Retention Enhancement", priority:1}
    ,{type:'hack', tpriority:1, name:"DataJack", priority:1}
    ,{type:'hack', tpriority:1, name:"Embedded Netburner Module", priority:1}
    ,{type:'hack', tpriority:1, name:"Embedded Netburner Module Core Implant", priority:1}
    ,{type:'hack', tpriority:1, name:"Embedded Netburner Module Core V2 Upgrade", priority:1}
    ,{type:'hack', tpriority:1, name:"Embedded Netburner Module Core V3 Upgrade", priority:1}
    ,{type:'hack', tpriority:1, name:"Embedded Netburner Module Analyze Engine", priority:1}
    ,{type:'hack', tpriority:1, name:"Embedded Netburner Module Direct Memory Access Upgrade", priority:1}
    ,{type:'hack', tpriority:1, name:"Neural Accelerator", priority:1}
    ,{type:'hack', tpriority:1, name:"Cranial Signal Processors - Gen I", priority:1}
    ,{type:'hack', tpriority:1, name:"Cranial Signal Processors - Gen II", priority:1}
    ,{type:'hack', tpriority:1, name:"Cranial Signal Processors - Gen III", priority:1}
    ,{type:'hack', tpriority:1, name:"Cranial Signal Processors - Gen IV", priority:1}
    ,{type:'hack', tpriority:1, name:"Cranial Signal Processors - Gen V", priority:1}
    ,{type:'hack', tpriority:1, name:"Neuronal Densification", priority:1}
    ,{type:'hack', tpriority:1, name:"PC Direct-Neural Interface", priority:1}
    ,{type:'hack', tpriority:1, name:"PC Direct-Neural Interface Optimization Submodule", priority:1}
    ,{type:'hack', tpriority:1, name:"PC Direct-Neural Interface NeuroNet Injector", priority:1}
    ,{type:'hack', tpriority:1, name:"HyperSight Corneal Implant", priority:1}
    ,{type:'hack', tpriority:1, name:"QLink", priority:1}
    ,{type:'hack', tpriority:1, name:"OmniTek InfoLoad", priority:1}
    ,{type:'hack', tpriority:1, name:"The Black Hand", priority:1}

    ,{type:'social/corp', tpriority:1, name:"Enhanced Social Interaction Implant", priority:0}
    ,{type:'social/corp', tpriority:1, name:"Speech Processor Implant", priority:0}
    ,{type:'social/corp', tpriority:1, name:"TITN-41 Gene-Modification Injection", priority:0}
    ,{type:'social/corp', tpriority:1, name:"Nuoptimal Nootropic Injector Implant", priority:0}
    ,{type:'social/corp', tpriority:1, name:"Speech Enhancement", priority:0}
    ,{type:'social/corp', tpriority:1, name:"FocusWire", priority:0}
    
    ,{type:'social', tpriority:1, name:"ADR-V1 Pheromone Gene", priority:1}
    ,{type:'social', tpriority:1, name:"ADR-V2 Pheromone Gene", priority:1}
    ,{type:'social', tpriority:1, name:"SmartJaw", priority:1}
    ,{type:'social', tpriority:1, name:"Social Negotiation Assistant (S.N.A)", priority:1}
    ,{type:'social', tpriority:1, name:"The Shadow's Simulacrum", priority:1}

    ,{type:'combat', tpriority:-1, name:"Augmented Targeting I", priority:2}
    ,{type:'combat', tpriority:-1, name:"Augmented Targeting II", priority:2}
    ,{type:'combat', tpriority:-1, name:"Augmented Targeting III", priority:2}
    ,{type:'combat', tpriority:-1, name:"Synthetic Heart", priority:2}
    ,{type:'combat', tpriority:-1, name:"Synfibril Muscle", priority:2}
    ,{type:'combat', tpriority:-1, name:"Combat Rib I", priority:2}
    ,{type:'combat', tpriority:-1, name:"Combat Rib II", priority:2}
    ,{type:'combat', tpriority:-1, name:"Combat Rib III", priority:2}
    ,{type:'combat', tpriority:-1, name:"Nanofiber Weave", priority:2}
    ,{type:'combat', tpriority:-1, name:"NEMEAN Subdermal Weave", priority:2}
    ,{type:'combat', tpriority:-1, name:"Wired Reflexes", priority:2}
    ,{type:'combat', tpriority:-1, name:"Graphene Bone Lacings", priority:2}
    ,{type:'combat', tpriority:-1, name:"Bionic Spine", priority:2}
    ,{type:'combat', tpriority:-1, name:"Bionic Arms", priority:2}
    ,{type:'combat', tpriority:-1, name:"Graphene Bionic Spine Upgrade", priority:2}
    ,{type:'combat', tpriority:-1, name:"Bionic Legs", priority:2}
    ,{type:'combat', tpriority:-1, name:"Graphene Bionic Legs Upgrade", priority:2}
    ,{type:'combat', tpriority:-1, name:"LuminCloaking-V1 Skin Implant", priority:2}
    ,{type:'combat', tpriority:-1, name:"LuminCloaking-V2 Skin Implant", priority:2}
    ,{type:'combat', tpriority:-1, name:"HemoRecirculator", priority:2}
    ,{type:'combat', tpriority:-1, name:"SmartSonar Implant", priority:2}
    ,{type:'combat', tpriority:-1, name:"CordiARC Fusion Reactor", priority:2}
    ,{type:'combat', tpriority:-1, name:"Neotra", priority:2}
    ,{type:'combat', tpriority:-1, name:"Photosynthetic Cells", priority:2}
    ,{type:'combat', tpriority:-1, name:"NutriGen Implant", priority:2}
    ,{type:'combat', tpriority:-1, name:"INFRARET Enhancement", priority:2}
    ,{type:'combat', tpriority:-1, name:"DermaForce Particle Barrier", priority:2}
    ,{type:'combat', tpriority:-1, name:"Graphene BranchiBlades Upgrade", priority:2}
    ,{type:'combat', tpriority:-1, name:"Graphene Bionic Arms Upgrade", priority:2}
    ,{type:'combat', tpriority:-1, name:"BrachiBlades", priority:2}
    
    ,{type:'bladeburner', tpriority:0, name:"EsperTech Bladeburner Eyewear", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"EMS-4 Recombination", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"ORION-MKIV Shoulder", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"Hyperion Plasma Cannon V1", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"Hyperion Plasma Cannon V2", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"GOLEM Serum", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"Vangelis Virus", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"Vangelis Virus 3.0", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"I.N.T.E.R.L.I.N.K.E.D", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"Blade's Runners", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"BLADE-51b Tesla Armor", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"BLADE-51b Tesla Armor: Power Cells Upgrade", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"BLADE-51b Tesla Armor: Energy Shielding Upgrade", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"BLADE-51b Tesla Armor: Unibeam Upgrade", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"BLADE-51b Tesla Armor: Omnibeam Upgrade", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"BLADE-51b Tesla Armor: IPU Upgrade", priority:0}
    ,{type:'bladeburner', tpriority:0, name:"The Blade's Simulacrum", priority:0}
    
    ,{type:'special', tpriority:1, name:"NeuroFlux Governor", priority:-999 } // special cased in autofaction
    ,{type:'special', tpriority:1, name:"The Red Pill", priority:10 }
    ,{type:'special', tpriority:1, name:"Neurotrainer I", priority:1}
    ,{type:'special', tpriority:1, name:"Neurotrainer II", priority:1}
    ,{type:'special', tpriority:1, name:"Neurotrainer III", priority:1}
    ,{type:'special', tpriority:1, name:"Power Recirculation Core", priority:1}
    ,{type:'special', tpriority:1, name:"SPTN-97 Gene Modification", priority:1}
    ,{type:'special', tpriority:1, name:"ECorp HVMind Implant", priority:1}
    ,{type:'special', tpriority:1, name:"Xanipher", priority:1}
    ,{type:'special', tpriority:1, name:"nextSENS Gene Modification", priority:1}
  ]
]