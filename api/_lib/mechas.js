const prefixes = [
  'Crimson', 'Iron', 'Shadow', 'Void', 'Ash', 'Storm', 'Cobalt', 'Obsidian',
  'Phantom', 'Apex', 'Neon', 'Havoc', 'Onyx', 'Ember', 'Frost', 'Rogue',
  'Titan', 'Zenith', 'Eclipse', 'Valkyrie', 'Cerberus', 'Wraith', 'Nova',
  'Specter', 'Aegis', 'Dusk', 'Feral', 'Tempest', 'Hollow', 'Chrome',
];

const suffixes = [
  'Harbinger', 'Sentinel', 'Reaver', 'Vanguard', 'Talon', 'Fang', 'Frame',
  'Warden', 'Breaker', 'Hunter', 'Strider', 'Lance', 'Blade', 'Wing',
  'Core', 'Edge', 'Strike', 'Fury', 'Reign', 'Ronin', 'Partisan', 'Viper',
  'Bastion', 'Raptor', 'Crusader', 'Revenant', 'Marauder', 'Dragoon',
];

const designations = [
  'GX-7', 'MK-III', 'Type-0', 'Rev.9', 'X-04', 'ASF-12', 'Unit-77', 'Kai',
  'Proto', 'S-Class', 'VX', 'Mod.6', 'Gen-V', 'NX-01', 'Sigma', 'Omega',
  'Delta-9', 'Zero',
];

const primaryWeapons = [
  'Twin-linked beam rifle array',
  '120mm autocannon with AP rounds',
  'Superheated plasma lance',
  'Electromagnetic rail accelerator',
  'Dual arc blades with energy sheathing',
  'Six-barrel rotary gatling laser',
  'Condensed particle cannon',
  'Thermal vibro-sword (2.4m)',
  'Multi-lock missile pod cluster (x24)',
  'Graviton impact hammer',
  'Anti-ship mega beam cannon',
  'Hyper-velocity kinetic slugthrower',
  'Cryo-lance with absolute zero tip',
  'Photon scatter cannon',
  'Mag-rail sniper system (4km range)',
  'Plasma cutter gauntlets',
];

const secondaryWeapons = [
  'Micro-missile swarm launcher (x48)',
  'Wrist-mounted rotary chaingun',
  'Shield-integrated beam cannon',
  'EMP smoke grenade dispenser',
  'Electrified javelin launcher',
  'Point-defense vulcan array',
  'Wire-guided rocket anchor',
  'Shoulder-mounted mortar tubes',
  'Close-range shotgun scatter pods',
  'Heat-seeking seeker drones (x6)',
  'Chest-mounted mega particle emitter',
  'Wrist blade with mono-molecular edge',
  'Grenade launcher with cluster munitions',
  'Flame projector (napalm gel)',
  'Ion disruptor pistol',
];

const armorParts = [
  'Phase-shift ablative plating',
  'Reactive nano-armor substrate',
  'Titanium-carbide composite frame',
  'Stealth field generator array',
  'Anti-beam reflective coating',
  'Gundanium alloy superstructure',
  'Layered ceramic-steel laminate',
  'Self-repairing smart armor mesh',
  'Electromagnetic barrier projector',
  'Depleted uranium reinforced joints',
  'Carbon nanotube exoskeleton',
  'Ablative heat-dispersal fins',
  'Modular bolt-on reactive panels',
];

const specialSystems = [
  'Neural-linked targeting suite',
  'ZERO system combat override',
  'Funnel drone deployment array (x8)',
  'Trans-Am burst overdrive system',
  'Active optical camouflage',
  'Quantum-entangled comms relay',
  'Psychoframe resonance cockpit',
  'Full-spectrum electronic warfare suite',
  'Miniaturized fusion reactor (output: 4.8GW)',
  'Gravity manipulation thruster pack',
  'Biosync pilot interface (pain feedback)',
  'Predictive AI co-pilot module',
  'Emergency atmospheric re-entry shield',
];

const pilotSkills = [
  'Veteran ace with 200+ confirmed kills',
  'Former colony gladiator champion',
  'Neural-dive combat specialist',
  'Legendary quick-draw record holder',
  'Ex-special forces black ops operative',
  'Survivor of the Lagrange Point Massacre',
  'Trained in zero-G close combat',
  'Prototype sync rate: 97.3%',
  'Three-time Solar Cup finalist',
  'Known to enter berserker combat trance',
  'Former test pilot for experimental frames',
  'Youngest graduate of Olympus Academy',
  'Defected super-soldier (gene-modded)',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMechaName(usedNames) {
  for (let i = 0; i < 100; i++) {
    const name = `${pick(prefixes)} ${pick(suffixes)} ${pick(designations)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  return `${pick(prefixes)} ${pick(suffixes)} ${pick(designations)}-${Math.floor(Math.random() * 99)}`;
}

function generateMecha(usedNames) {
  const name = generateMechaName(usedNames);
  const descriptorCount = 3 + Math.floor(Math.random() * 4);

  const descriptors = [];
  descriptors.push(pick(primaryWeapons));
  if (descriptorCount > 3) {
    descriptors.push(pick(secondaryWeapons));
  }
  descriptors.push(pick(armorParts));
  descriptors.push(pick(specialSystems));
  descriptors.push(pick(pilotSkills));

  while (descriptors.length < descriptorCount) {
    const pools = [secondaryWeapons, armorParts, specialSystems];
    const pool = pick(pools);
    const item = pick(pool);
    if (!descriptors.includes(item)) {
      descriptors.push(item);
    }
  }

  return { name, descriptors };
}

export function generateFourMechas() {
  const usedNames = new Set();
  return [
    generateMecha(usedNames),
    generateMecha(usedNames),
    generateMecha(usedNames),
    generateMecha(usedNames),
  ];
}
