export interface Monster {
  index: string;
  name: string;
  desc?: string;
  size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: ArmorClass[];
  hit_points: number;
  hit_dice: string;
  hit_points_roll: string;
  speed: MonsterSpeed;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: ProficiencyBonus[];
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: ConditionImmunity[]; // À adapter si besoin
  senses: MonsterSenses;
  languages: string;
  challenge_rating: number;
  proficiency_bonus: number;
  xp: number;
  special_abilities?: SpecialAbility[];
  actions: MonsterAction[];
  legendary_actions?: MonsterAction[];
  reactions?: MonsterAction[];
  image: string;
  url: string;
  updated_at: string;
  forms?: unknown[];
}

export interface ArmorClass {
  type: 'dex' | 'natural' | string;
  value: number;
}

export interface MonsterSpeed {
  walk?: string;
  burrow?: string;
  climb?: string;
  fly?: string;
  swim?: string;
  [key: string]: string | undefined;
}

export interface MonsterSenses {
  blindsight?: string;
  darkvision?: string;
  tremorsense?: string;
  truesight?: string;
  passive_perception: number;
  [key: string]: string | number | undefined;
}

export interface ProficiencyBonus {
  value: number;
  proficiency: APIReference;
}

export interface APIReference {
  index: string;
  name: string;
  url: string;
}

export interface ConditionImmunity {
  index: string;
  name: string;
  url: string;
}

export interface SpecialAbility {
  name: string;
  desc: string;
  dc?: DifficultyClass;
  damage?: DamageComponent[];
  spellcasting?: Spellcasting;
  usage?: Usage;
}

export interface MonsterAction {
  name: string;
  desc: string;
  attack_bonus?: number;
  dc?: DifficultyClass;
  damage?: DamageComponent[];
  multiattack_type?: 'actions';
  actions?: SubAction[];
  usage?: Usage;
}

export interface SubAction {
  action_name: string;
  count: string;
  type: 'melee' | 'ranged' | 'ability' | string;
}

export interface DifficultyClass {
  dc_type: APIReference;
  dc_value: number;
  success_type: 'none' | 'half' | 'other'; // selon les cas rencontrés
}

export interface Usage {
  type: 'per day' | 'recharge on roll' | 'recharge after rest' | string;
  times?: number;
  rest_types?: string[];
  dice?: string;
  min_value?: number;
}

export interface DamageComponent {
  damage_type: APIReference;
  damage_dice: string;
}

export interface Spellcasting {
  level: number;
  ability: APIReference;
  dc: number;
  modifier: number;
  components_required: string[]; // ex: ['V', 'S', 'M']
  school: string;
  slots: Record<string, number>; // exemple : { "1": 3 }
  spells: SpellReference[];
}

export interface SpellReference {
  name: string;
  level: number;
  url: string;
}