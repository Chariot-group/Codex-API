import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateSpeedDto {
  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  walk?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  climb?: number;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsNumber()
  swim?: number;

  @ApiProperty({ example: 60, required: false })
  @IsOptional()
  @IsNumber()
  fly?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  burrow?: number;
}

export class CreateAbilityScoresDto {
  @ApiProperty({ example: 9, default: 10, description: "Strength score" })
  @IsOptional()
  @IsNumber()
  strength?: number;

  @ApiProperty({ example: 14, default: 10, description: "Dexterity score" })
  @IsOptional()
  @IsNumber()
  dexterity?: number;

  @ApiProperty({ example: 11, default: 10, description: "Constitution score" })
  @IsOptional()
  @IsNumber()
  constitution?: number;

  @ApiProperty({ example: 17, default: 10, description: "Intelligence score (primary for Mage)" })
  @IsOptional()
  @IsNumber()
  intelligence?: number;

  @ApiProperty({ example: 12, default: 10, description: "Wisdom score" })
  @IsOptional()
  @IsNumber()
  wisdom?: number;

  @ApiProperty({ example: 11, default: 10, description: "Charisma score" })
  @IsOptional()
  @IsNumber()
  charisma?: number;
}

export class CreateSavingThrowsDto {
  @ApiProperty({ example: -1, default: 0, description: "Strength saving throw modifier" })
  @IsOptional()
  @IsNumber()
  strength?: number;

  @ApiProperty({ example: 2, default: 0, description: "Dexterity saving throw modifier" })
  @IsOptional()
  @IsNumber()
  dexterity?: number;

  @ApiProperty({ example: 0, default: 0, description: "Constitution saving throw modifier" })
  @IsOptional()
  @IsNumber()
  constitution?: number;

  @ApiProperty({ example: 6, default: 0, description: "Intelligence saving throw modifier (proficient)" })
  @IsOptional()
  @IsNumber()
  intelligence?: number;

  @ApiProperty({ example: 4, default: 0, description: "Wisdom saving throw modifier (proficient)" })
  @IsOptional()
  @IsNumber()
  wisdom?: number;

  @ApiProperty({ example: 0, default: 0, description: "Charisma saving throw modifier" })
  @IsOptional()
  @IsNumber()
  charisma?: number;
}

export class CreateSkillsDto {
  @ApiProperty({ example: 3, default: 0 })
  @IsOptional()
  @IsNumber()
  athletics?: number;

  @ApiProperty({ example: 2, default: 0 })
  @IsOptional()
  @IsNumber()
  acrobatics?: number;

  @ApiProperty({ example: 3, default: 0 })
  @IsOptional()
  @IsNumber()
  sleightHand?: number;

  @ApiProperty({ example: -1, default: 0 })
  @IsOptional()
  @IsNumber()
  stealth?: number;

  @ApiProperty({ example: 6, default: 0, description: "Arcana skill (proficient for Mage)" })
  @IsOptional()
  @IsNumber()
  arcana?: number;

  @ApiProperty({ example: 6, default: 0, description: "History skill (proficient for Mage)" })
  @IsOptional()
  @IsNumber()
  history?: number;

  @ApiProperty({ example: 2, default: 0 })
  @IsOptional()
  @IsNumber()
  investigation?: number;

  @ApiProperty({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  nature?: number;

  @ApiProperty({ example: 7, default: 0 })
  @IsOptional()
  @IsNumber()
  religion?: number;

  @ApiProperty({ example: 3, default: 0 })
  @IsOptional()
  @IsNumber()
  animalHandling?: number;

  @ApiProperty({ example: -1, default: 0 })
  @IsOptional()
  @IsNumber()
  insight?: number;

  @ApiProperty({ example: 1, default: 0 })
  @IsOptional()
  @IsNumber()
  medicine?: number;

  @ApiProperty({ example: 7, default: 0 })
  @IsOptional()
  @IsNumber()
  perception?: number;

  @ApiProperty({ example: 2, default: 0 })
  @IsOptional()
  @IsNumber()
  survival?: number;

  @ApiProperty({ example: 2, default: 0 })
  @IsOptional()
  @IsNumber()
  deception?: number;

  @ApiProperty({ example: 2, default: 0 })
  @IsOptional()
  @IsNumber()
  intimidation?: number;

  @ApiProperty({ example: 1, default: 0 })
  @IsOptional()
  @IsNumber()
  performance?: number;

  @ApiProperty({ example: 2, default: 0 })
  @IsOptional()
  @IsNumber()
  persuasion?: number;
}

export class CreateSenseDto {
  @ApiProperty({ example: "darkvision" })
  @IsString()
  name: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  value: number;
}

export class CreateStatsDto {
  @ApiProperty({
    example: 3,
    default: 0,
    description: "Size: 0=Tiny, 1=Small, 2=Medium, 3=Large, 4=Huge, 5=Gargantuan",
  })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiProperty({ example: 40, default: 0, description: "Maximum hit points" })
  @IsOptional()
  @IsNumber()
  maxHitPoints?: number;

  @ApiProperty({ example: 40, required: false, description: "Current hit points, defaults to maxHitPoints" })
  @IsOptional()
  @IsNumber()
  currentHitPoints?: number;

  @ApiProperty({ example: 0, default: 0, description: "Temporary hit points" })
  @IsOptional()
  @IsNumber()
  tempHitPoints?: number;

  @ApiProperty({ example: 12, default: 10, description: "Armor Class (with Mage Armor: 15)" })
  @IsOptional()
  @IsNumber()
  armorClass?: number;

  @ApiProperty({ type: CreateSpeedDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSpeedDto)
  speed?: CreateSpeedDto;

  @ApiProperty({ type: CreateAbilityScoresDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAbilityScoresDto)
  abilityScores?: CreateAbilityScoresDto;

  @ApiProperty({
    type: [String],
    example: ["Common", "Draconic", "Dwarvish", "Elvish"],
    default: [],
    description: "Languages known by the creature",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ example: 11, default: 0, description: "Passive Perception score" })
  @IsOptional()
  @IsNumber()
  passivePerception?: number;

  @ApiProperty({ type: CreateSavingThrowsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSavingThrowsDto)
  savingThrows?: CreateSavingThrowsDto;

  @ApiProperty({ type: CreateSkillsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSkillsDto)
  skills?: CreateSkillsDto;

  @ApiProperty({ type: [CreateSenseDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSenseDto)
  senses?: CreateSenseDto[];
}

export class CreateAffinitiesDto {
  @ApiProperty({ type: [String], example: ["fire", "cold"], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resistances?: string[];

  @ApiProperty({ type: [String], example: ["poison", "psychic"], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  immunities?: string[];

  @ApiProperty({ type: [String], example: ["lightning"], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vulnerabilities?: string[];

  @ApiProperty({
    type: [String],
    example: ["charmed", "frightened"],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditionImmunities?: string[];
}

export class CreateAbilityDto {
  @ApiProperty({ example: "Spellcasting", description: "Name of the special ability" })
  @IsString()
  name: string;

  @ApiProperty({
    example:
      "The mage is a 9th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 14, +6 to hit with spell attacks). The mage has the following wizard spells prepared: Cantrips (at will): fire bolt, light, mage hand, prestidigitation. 1st level (4 slots): detect magic, mage armor, magic missile, shield. 2nd level (3 slots): misty step, suggestion. 3rd level (3 slots): counterspell, fireball, fly. 4th level (3 slots): greater invisibility, ice storm. 5th level (1 slot): cone of cold.",
    description: "Description of the ability",
  })
  @IsString()
  description: string;
}

export class CreateSpellcastingDto {
  @ApiProperty({ example: "Intelligence", required: false, description: "Spellcasting ability" })
  @IsOptional()
  @IsString()
  ability?: string;

  @ApiProperty({ example: 14, required: false, description: "Spell save DC" })
  @IsOptional()
  @IsNumber()
  saveDC?: number;

  @ApiProperty({ example: 6, description: "Spell attack bonus" })
  @IsOptional()
  @IsNumber()
  attackBonus?: number;

  @ApiProperty({
    example: {
      "1": { total: 4, used: 1 },
      "2": { total: 3, used: 0 },
      "3": { total: 3, used: 1 },
      "4": { total: 3, used: 0 },
      "5": { total: 1, used: 0 },
    },
    required: false,
    description: "Spell slots by level (will be converted to Map internally)",
  })
  @IsOptional()
  spellSlotsByLevel?:
    | Map<string, { total?: number; used?: number }>
    | Record<string, { total?: number; used?: number }>;

  @ApiProperty({ example: 14, default: 0, description: "Total spell slots available" })
  @IsOptional()
  @IsNumber()
  totalSlots?: number;

  @ApiProperty({
    type: [String],
    example: [
      "fire-bolt",
      "mage-armor",
      "magic-missile",
      "shield",
      "misty-step",
      "counterspell",
      "fireball",
      "greater-invisibility",
      "cone-of-cold",
    ],
    default: [],
    description: "Array of spell IDs or references",
  })
  @IsOptional()
  @IsArray()
  spells?: any[]; // Référence vers des Spell IDs
}

export class CreateDamageDto {
  @ApiProperty({ example: "1d8+3", required: false })
  @IsOptional()
  @IsString()
  dice?: string;

  @ApiProperty({ example: "slashing", required: false })
  @IsOptional()
  @IsString()
  type?: string;
}

export class CreateSaveDto {
  @ApiProperty({ example: "dex", description: "str, dex, con, int, wis, cha" })
  @IsString()
  type: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  dc: number;

  @ApiProperty({ example: "half", required: false })
  @IsOptional()
  @IsString()
  successType?: string;
}

export class CreateUsageDto {
  @ApiProperty({
    example: "per day",
    description: "at will, per day, recharge, etc.",
  })
  @IsString()
  type: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  times?: number;

  @ApiProperty({ example: "1d6", required: false })
  @IsOptional()
  @IsString()
  dice?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  minValue?: number;
}

export class CreateActionDto {
  @ApiProperty({ example: "Longsword", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "melee", required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  attackBonus?: number;

  @ApiProperty({ type: CreateDamageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDamageDto)
  damage?: CreateDamageDto;

  @ApiProperty({ example: "5 ft.", required: false })
  @IsOptional()
  @IsString()
  range?: string;

  @ApiProperty({ type: CreateSaveDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSaveDto)
  save?: CreateSaveDto;

  @ApiProperty({
    example: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target.",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: CreateUsageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUsageDto)
  usage?: CreateUsageDto;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  legendaryActionCost?: number;
}

export class CreateActionsDto {
  @ApiProperty({
    type: [CreateActionDto],
    default: [],
    example: [
      {
        name: "Dagger",
        type: "melee",
        attackBonus: 5,
        damage: { dice: "1d4+2", type: "piercing" },
        range: "5 ft. or range 20/60 ft.",
        description:
          "Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d4 + 2) piercing damage.",
      },
    ],
    description: "Standard actions available to the creature",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActionDto)
  standard?: CreateActionDto[];

  @ApiProperty({ type: [CreateActionDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActionDto)
  legendary?: CreateActionDto[];

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  legendaryActionsPerDay?: number;

  @ApiProperty({ type: [CreateActionDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActionDto)
  lair?: CreateActionDto[];

  @ApiProperty({ type: [CreateActionDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActionDto)
  reactions?: CreateActionDto[];

  @ApiProperty({ type: [CreateActionDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActionDto)
  bonus?: CreateActionDto[];
}

export class CreateChallengeDto {
  @ApiProperty({ example: 6, required: false, description: "Challenge Rating" })
  @IsOptional()
  @IsNumber()
  challengeRating?: number;

  @ApiProperty({ example: 2300, required: false, description: "Experience points awarded" })
  @IsOptional()
  @IsNumber()
  experiencePoints?: number;
}

export class CreateProfileDto {
  @ApiProperty({ example: "humanoid", required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: "goblinoid", required: false })
  @IsOptional()
  @IsString()
  subtype?: string;

  @ApiProperty({ example: "neutral evil", required: false })
  @IsOptional()
  @IsString()
  alignment?: string;
}

export class CreateMonsterContentDto {
  @ApiProperty({ example: "Mage", description: "Name of the monster" })
  @IsString()
  name: string;

  @ApiProperty({ type: CreateStatsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateStatsDto)
  stats?: CreateStatsDto;

  @ApiProperty({ type: CreateAffinitiesDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAffinitiesDto)
  affinities?: CreateAffinitiesDto;

  @ApiProperty({
    type: [CreateAbilityDto],
    default: [],
    example: [
      {
        name: "Fey Ancestry",
        description:
          "The creature has advantage on saving throws against being charmed, and magic can't put it to sleep.",
      },
      {
        name: "Innate Spellcasting",
        description:
          "The creature's innate spellcasting ability is Charisma (spell save DC 12). It can innately cast the following spells, requiring no material components: At will: dancing lights, 1/day each: darkness, faerie fire.",
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAbilityDto)
  abilities?: CreateAbilityDto[];

  @ApiProperty({
    type: [CreateSpellcastingDto],
    default: [],
    example: [
      {
        ability: "Intelligence",
        saveDC: 14,
        attackBonus: 6,
        spellSlotsByLevel: {
          "1": { total: 4, used: 1 },
          "2": { total: 3, used: 0 },
          "3": { total: 3, used: 1 },
          "4": { total: 3, used: 0 },
          "5": { total: 1, used: 0 },
        },
        totalSlots: 14,
        spells: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpellcastingDto)
  spellcasting?: CreateSpellcastingDto[];

  @ApiProperty({ type: CreateActionsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateActionsDto)
  actions?: CreateActionsDto;

  @ApiProperty({ type: CreateChallengeDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateChallengeDto)
  challenge?: CreateChallengeDto;

  @ApiProperty({ type: CreateProfileDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile?: CreateProfileDto;
}
