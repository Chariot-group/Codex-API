import { DtoMapper } from "@/common/mappers/common.mapper";
import { Monster } from "@/resources/monsters/schemas/monster.schema";
import { MonsterContent } from "@/resources/monsters/schemas/monster-content.schema";
import { Types } from "mongoose";
import { CreateMonsterDto } from "@/resources/monsters/dtos/create-monster.dto";
import {
  CreateMonsterContentDto,
  CreateStatsDto,
  CreateSpeedDto,
  CreateAbilityScoresDto,
  CreateSavingThrowsDto,
  CreateSkillsDto,
  CreateSenseDto,
  CreateAffinitiesDto,
  CreateAbilityDto,
  CreateSpellcastingDto,
  CreateActionsDto,
  CreateActionDto,
  CreateDamageDto,
  CreateSaveDto,
  CreateUsageDto,
  CreateChallengeDto,
  CreateProfileDto,
} from "@/resources/monsters/dtos/create-monster-content.dto";
import { Stats } from "@/resources/monsters/schemas/stats/stats.schema";
import { Speed } from "@/resources/monsters/schemas/stats/sub/speed.schema";
import { AbilityScores } from "@/resources/monsters/schemas/stats/sub/abilityScores.schema";
import { SavingThrows } from "@/resources/monsters/schemas/stats/sub/savingThrows.schema";
import { Skills } from "@/resources/monsters/schemas/stats/sub/skill.schema";
import { Sense } from "@/resources/monsters/schemas/stats/sub/sense";
import { Affinities } from "@/resources/monsters/schemas/affinities/affinities.schema";
import { Ability } from "@/resources/monsters/schemas/ability/ability.schema";
import { Spellcasting } from "@/resources/monsters/schemas/spellcasting/spellcasting.schema";
import { Actions } from "@/resources/monsters/schemas/actions/actions.schema";
import { Action } from "@/resources/monsters/schemas/actions/sub/action.schema";
import { Damage } from "@/resources/monsters/schemas/actions/sub/damage.schema";
import { Save } from "@/resources/monsters/schemas/actions/sub/save.schema";
import { Usage } from "@/resources/monsters/schemas/actions/sub/usage.schema";
import { Challenge } from "@/resources/monsters/schemas/challenge/challenge.schema";
import { Profile } from "@/resources/monsters/schemas/profile/profile.schema";

export class MonstersMapper extends DtoMapper<Monster> {
  /**
   * Convert CreateMonsterDto to Monster entity
   * @param dto CreateMonsterDto source
   * @returns Monster entity
   */
  dtoToEntity(dto: CreateMonsterDto): Monster {
    const monster: Monster = new Monster();

    monster.translations = new Map<string, MonsterContent>();
    const monsterContent: MonsterContent = this.dtoMonsterContentToEntity(dto.monsterContent);

    monster.translations.set(dto.lang, monsterContent);
    monster.languages = [dto.lang];

    return monster;
  }

  /**
   * Convert CreateMonsterContentDto to MonsterContent entity
   * @param dto CreateMonsterContentDto source
   * @returns MonsterContent entity
   */
  dtoMonsterContentToEntity(dto: CreateMonsterContentDto): MonsterContent {
    const monsterContent: MonsterContent = new MonsterContent();

    monsterContent.srd = false; // Par défaut true
    monsterContent.name = dto.name;

    // Stats
    if (dto.stats) {
      monsterContent.stats = this.dtoStatsToEntity(dto.stats);
    }

    // Affinities
    if (dto.affinities) {
      monsterContent.affinities = this.dtoAffinitiesToEntity(dto.affinities);
    }

    // Abilities
    if (dto.abilities && dto.abilities.length > 0) {
      monsterContent.abilities = dto.abilities.map((ability) => this.dtoAbilityToEntity(ability));
    }

    // Spellcasting
    if (dto.spellcasting && dto.spellcasting.length > 0) {
      monsterContent.spellcasting = dto.spellcasting.map((spellcasting) => this.dtoSpellcastingToEntity(spellcasting));
    }

    // Actions
    if (dto.actions) {
      monsterContent.actions = this.dtoActionsToEntity(dto.actions);
    }

    // Challenge
    if (dto.challenge) {
      monsterContent.challenge = this.dtoChallengeToEntity(dto.challenge);
    }

    // Profile
    if (dto.profile) {
      monsterContent.profile = this.dtoProfileToEntity(dto.profile);
    }

    return monsterContent;
  }

  /**
   * Convert CreateStatsDto to Stats entity
   * @param dto CreateStatsDto source
   * @returns Stats entity
   */
  private dtoStatsToEntity(dto: CreateStatsDto): Stats {
    const stats: Stats = new Stats();

    stats.size = dto.size ?? 0;
    stats.maxHitPoints = dto.maxHitPoints ?? 0;
    stats.currentHitPoints = dto.currentHitPoints ?? dto.maxHitPoints ?? 0;
    stats.tempHitPoints = dto.tempHitPoints ?? 0;
    stats.armorClass = dto.armorClass ?? 10;
    stats.passivePerception = dto.passivePerception ?? 0;
    stats.languages = dto.languages ?? [];

    // Speed
    if (dto.speed) {
      stats.speed = this.dtoSpeedToEntity(dto.speed);
    }

    // Ability Scores
    if (dto.abilityScores) {
      stats.abilityScores = this.dtoAbilityScoresToEntity(dto.abilityScores);
    }

    // Saving Throws
    if (dto.savingThrows) {
      stats.savingThrows = this.dtoSavingThrowsToEntity(dto.savingThrows);
    }

    // Skills
    if (dto.skills) {
      stats.skills = this.dtoSkillsToEntity(dto.skills);
    }

    // Senses
    if (dto.senses && dto.senses.length > 0) {
      stats.senses = dto.senses.map((sense) => this.dtoSenseToEntity(sense));
    }

    return stats;
  }

  /**
   * Convert CreateSpeedDto to Speed entity
   * @param dto CreateSpeedDto source
   * @returns Speed entity
   */
  private dtoSpeedToEntity(dto: CreateSpeedDto): Speed {
    const speed: Speed = new Speed();

    speed.walk = dto.walk;
    speed.climb = dto.climb;
    speed.swim = dto.swim;
    speed.fly = dto.fly;
    speed.burrow = dto.burrow;

    return speed;
  }

  /**
   * Convert CreateAbilityScoresDto to AbilityScores entity
   * @param dto CreateAbilityScoresDto source
   * @returns AbilityScores entity
   */
  private dtoAbilityScoresToEntity(dto: CreateAbilityScoresDto): AbilityScores {
    const abilityScores: AbilityScores = new AbilityScores();

    abilityScores.strength = dto.strength ?? 10;
    abilityScores.dexterity = dto.dexterity ?? 10;
    abilityScores.constitution = dto.constitution ?? 10;
    abilityScores.intelligence = dto.intelligence ?? 10;
    abilityScores.wisdom = dto.wisdom ?? 10;
    abilityScores.charisma = dto.charisma ?? 10;

    return abilityScores;
  }

  /**
   * Convert CreateSavingThrowsDto to SavingThrows entity
   * @param dto CreateSavingThrowsDto source
   * @returns SavingThrows entity
   */
  private dtoSavingThrowsToEntity(dto: CreateSavingThrowsDto): SavingThrows {
    const savingThrows: SavingThrows = new SavingThrows();

    savingThrows.strength = dto.strength ?? 0;
    savingThrows.dexterity = dto.dexterity ?? 0;
    savingThrows.constitution = dto.constitution ?? 0;
    savingThrows.intelligence = dto.intelligence ?? 0;
    savingThrows.wisdom = dto.wisdom ?? 0;
    savingThrows.charisma = dto.charisma ?? 0;

    return savingThrows;
  }

  /**
   * Convert CreateSkillsDto to Skills entity
   * @param dto CreateSkillsDto source
   * @returns Skills entity
   */
  private dtoSkillsToEntity(dto: CreateSkillsDto): Skills {
    const skills: Skills = new Skills();

    skills.athletics = dto.athletics ?? 0;
    skills.acrobatics = dto.acrobatics ?? 0;
    skills.sleightHand = dto.sleightHand ?? 0;
    skills.stealth = dto.stealth ?? 0;
    skills.arcana = dto.arcana ?? 0;
    skills.history = dto.history ?? 0;
    skills.investigation = dto.investigation ?? 0;
    skills.nature = dto.nature ?? 0;
    skills.religion = dto.religion ?? 0;
    skills.animalHandling = dto.animalHandling ?? 0;
    skills.insight = dto.insight ?? 0;
    skills.medicine = dto.medicine ?? 0;
    skills.perception = dto.perception ?? 0;
    skills.survival = dto.survival ?? 0;
    skills.deception = dto.deception ?? 0;
    skills.intimidation = dto.intimidation ?? 0;
    skills.performance = dto.performance ?? 0;
    skills.persuasion = dto.persuasion ?? 0;

    return skills;
  }

  /**
   * Convert CreateSenseDto to Sense entity
   * @param dto CreateSenseDto source
   * @returns Sense entity
   */
  private dtoSenseToEntity(dto: CreateSenseDto): Sense {
    const sense: Sense = new Sense();

    sense.name = dto.name;
    sense.value = dto.value;

    return sense;
  }

  /**
   * Convert CreateAffinitiesDto to Affinities entity
   * @param dto CreateAffinitiesDto source
   * @returns Affinities entity
   */
  private dtoAffinitiesToEntity(dto: CreateAffinitiesDto): Affinities {
    const affinities: Affinities = new Affinities();

    affinities.resistances = dto.resistances ?? [];
    affinities.immunities = dto.immunities ?? [];
    affinities.vulnerabilities = dto.vulnerabilities ?? [];
    affinities.conditionImmunities = dto.conditionImmunities ?? [];

    return affinities;
  }

  /**
   * Convert CreateAbilityDto to Ability entity
   * @param dto CreateAbilityDto source
   * @returns Ability entity
   */
  private dtoAbilityToEntity(dto: CreateAbilityDto): Ability {
    const ability: Ability = new Ability();

    ability.name = dto.name;
    ability.description = dto.description;

    return ability;
  }

  /**
   * Convert CreateSpellcastingDto to Spellcasting entity
   * @param dto CreateSpellcastingDto source
   * @returns Spellcasting entity
   */
  private dtoSpellcastingToEntity(dto: CreateSpellcastingDto): Spellcasting {
    const spellcasting: Spellcasting = new Spellcasting();

    spellcasting.ability = dto.ability;
    spellcasting.saveDC = dto.saveDC;
    spellcasting.attackBonus = dto.attackBonus ?? 0;
    spellcasting.totalSlots = dto.totalSlots ?? 0;
    spellcasting.spells = dto.spells?.map((id) => new Types.ObjectId(id)) ?? [];

    // Convert spellSlotsByLevel (Record ou Map)
    if (dto.spellSlotsByLevel) {
      if (dto.spellSlotsByLevel instanceof Map) {
        spellcasting.spellSlotsByLevel = dto.spellSlotsByLevel;
      } else {
        // Convert Record to Map
        spellcasting.spellSlotsByLevel = new Map(
          Object.entries(dto.spellSlotsByLevel).map(([key, value]) => [key, value]),
        );
      }
    }

    return spellcasting;
  }

  /**
   * Convert CreateActionsDto to Actions entity
   * @param dto CreateActionsDto source
   * @returns Actions entity
   */
  private dtoActionsToEntity(dto: CreateActionsDto): Actions {
    const actions: Actions = new Actions();

    actions.standard = dto.standard?.map((action) => this.dtoActionToEntity(action)) ?? [];
    actions.legendary = dto.legendary?.map((action) => this.dtoActionToEntity(action)) ?? [];
    actions.legendaryActionsPerDay = dto.legendaryActionsPerDay;
    actions.lair = dto.lair?.map((action) => this.dtoActionToEntity(action)) ?? [];
    actions.reactions = dto.reactions?.map((action) => this.dtoActionToEntity(action)) ?? [];
    actions.bonus = dto.bonus?.map((action) => this.dtoActionToEntity(action)) ?? [];

    return actions;
  }

  /**
   * Convert CreateActionDto to Action entity
   * @param dto CreateActionDto source
   * @returns Action entity
   */
  private dtoActionToEntity(dto: CreateActionDto): Action {
    const action: Action = new Action();

    action.name = dto.name;
    action.type = dto.type;
    action.attackBonus = dto.attackBonus;
    action.range = dto.range;
    action.description = dto.description;
    action.legendaryActionCost = dto.legendaryActionCost;

    // Damage
    if (dto.damage) {
      action.damage = this.dtoDamageToEntity(dto.damage);
    }

    // Save
    if (dto.save) {
      action.save = this.dtoSaveToEntity(dto.save);
    }

    // Usage
    if (dto.usage) {
      action.usage = this.dtoUsageToEntity(dto.usage);
    }

    return action;
  }

  /**
   * Convert CreateDamageDto to Damage entity
   * @param dto CreateDamageDto source
   * @returns Damage entity
   */
  private dtoDamageToEntity(dto: CreateDamageDto): Damage {
    const damage: Damage = new Damage();

    damage.dice = dto.dice;
    damage.type = dto.type;

    return damage;
  }

  /**
   * Convert CreateSaveDto to Save entity
   * @param dto CreateSaveDto source
   * @returns Save entity
   */
  private dtoSaveToEntity(dto: CreateSaveDto): Save {
    const save: Save = new Save();

    save.type = dto.type;
    save.dc = dto.dc;
    save.successType = dto.successType;

    return save;
  }

  /**
   * Convert CreateUsageDto to Usage entity
   * @param dto CreateUsageDto source
   * @returns Usage entity
   */
  private dtoUsageToEntity(dto: CreateUsageDto): Usage {
    const usage: Usage = new Usage();

    usage.type = dto.type;
    usage.times = dto.times;
    usage.dice = dto.dice;
    usage.minValue = dto.minValue;

    return usage;
  }

  /**
   * Convert CreateChallengeDto to Challenge entity
   * @param dto CreateChallengeDto source
   * @returns Challenge entity
   */
  private dtoChallengeToEntity(dto: CreateChallengeDto): Challenge {
    const challenge: Challenge = new Challenge();

    challenge.challengeRating = dto.challengeRating;
    challenge.experiencePoints = dto.experiencePoints;

    return challenge;
  }

  /**
   * Convert CreateProfileDto to Profile entity
   * @param dto CreateProfileDto source
   * @returns Profile entity
   */
  private dtoProfileToEntity(dto: CreateProfileDto): Profile {
    const profile: Profile = new Profile();

    profile.type = dto.type;
    profile.subtype = dto.subtype;
    profile.alignment = dto.alignment;

    return profile;
  }
}
