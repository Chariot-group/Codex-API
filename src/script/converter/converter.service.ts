import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { readFile } from "fs/promises";
import { join } from "path";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { SpellContent } from "@/resources/spells/schemas/spell-content.schema";
import { Monster } from "@/resources/monsters/schemas/monster.schema";
import { MonsterContent } from "@/resources/monsters/schemas/monster-content.schema";
import { Stats } from "@/resources/monsters/schemas/stats/stats.schema";
import { SavingThrows } from "@/resources/monsters/schemas/stats/sub/savingThrows.schema";
import { Skills } from "@/resources/monsters/schemas/stats/sub/skill.schema";
import { Sense } from "@/resources/monsters/schemas/stats/sub/sense";
import { Speed } from "@/resources/monsters/schemas/stats/sub/speed.schema";
import { Affinities } from "@/resources/monsters/schemas/affinities/affinities.schema";
import { Challenge } from "@/resources/monsters/schemas/challenge/challenge.schema";
import { Profile } from "@/resources/monsters/schemas/profile/profile.schema";
import { Action } from "@/resources/monsters/schemas/actions/sub/action.schema";
import { Damage } from "@/resources/monsters/schemas/actions/sub/damage.schema";
import { Actions } from "@/resources/monsters/schemas/actions/actions.schema";
import { Save } from "@/resources/monsters/schemas/actions/sub/save.schema";
import { Usage } from "@/resources/monsters/schemas/actions/sub/usage.schema";
@Injectable()
export class ConverterService {
  readonly SERVICE_NAME = this.constructor.name;

  constructor(
    @InjectModel(Spell.name) private readonly spellModel: Model<Spell>,
    @InjectModel(Monster.name) private readonly monsterModel: Model<Monster>,
  ) {}

  async launch(resource: string): Promise<void> {
    // Chemin qui fonctionne en dev (./src) et en prod (./dist/src)
    const basePath = process.env.NODE_ENV === 'production' 
      ? join(process.cwd(), 'dist', 'src', 'script', 'output')
      : join(process.cwd(), 'src', 'script', 'output');
    const inputPath = join(basePath, `${resource}.json`);

    Logger.log(`Lecture depuis ${inputPath}...`, this.SERVICE_NAME);
    const file = await readFile(inputPath, "utf-8");
    const rawData = JSON.parse(file);

    if (resource === "spells") {
      await this.convertSpells(rawData);
    } else if (resource === "monsters") {
      await this.convertMonsters(rawData);
    } else {
      Logger.error(
        `Ressource inconnue "${resource}". Seuls les sorts ("spells") et les monstres ("monsters") sont supportés pour le moment.`,
        this.SERVICE_NAME,
      );
    }
  }

  private async convertSpells(rawData): Promise<void> {
    Logger.log(`Conversion de ${rawData.length} sorts...`, this.SERVICE_NAME);
    const spellContents: Partial<SpellContent>[] = rawData.map(this.mapExternalSpell);

    const spells: Spell[] = spellContents.map(this.mapSpell);

    Logger.log(`Insertion en base...`, this.SERVICE_NAME);
    await this.spellModel.insertMany(spells);
    Logger.log(`✔️ ${spells.length} sorts insérés`, this.SERVICE_NAME);
  }

  private mapExternalSpell(entry: any): Partial<SpellContent> {
    const baseDamage = entry.damage?.damage_at_slot_level?.["2"] ?? entry.damage?.damage_at_character_level?.["1"];
    const healing = entry.heal_at_slot_level?.["2"];

    let effectType: number;

    if (baseDamage) {
      effectType = 0;
    } else if (healing) {
      effectType = 1;
    } else {
      effectType = 2;
    }

    let spellcontent: SpellContent = new SpellContent();

    spellcontent.name = entry.name;
    spellcontent.level = entry.level;
    spellcontent.school = entry.school.name;
    spellcontent.description = (entry.desc ?? []).join("\n\n");
    spellcontent.components = entry.components ?? [];
    spellcontent.castingTime = entry.casting_time;
    spellcontent.duration = entry.duration;
    spellcontent.range = entry.range;
    spellcontent.effectType = effectType;
    spellcontent.damage = baseDamage;
    spellcontent.srd = true;
    spellcontent.createdAt = new Date();
    spellcontent.updatedAt = new Date();

    return spellcontent;
  }

  private mapSpell(entry: SpellContent): Spell {
    let translations: Map<string, SpellContent> = new Map();
    translations.set("en", entry);

    let spell: Spell = new Spell();

    spell.tag = 1;
    spell.languages = ["en"];
    spell.translations = translations;

    return spell;
  }

  private async convertMonsters(rawData): Promise<void> {
    Logger.log(`Conversion de ${rawData.length} monstres...`, this.SERVICE_NAME);

    const monsterContents: Partial<MonsterContent>[] = await Promise.all(
      rawData.map((entry) => this.mapExternalMonster(entry)),
    );

    const monsters: Monster[] = monsterContents.map(this.mapMonster);

    Logger.log(`Insertion en base...`, this.SERVICE_NAME);
    await this.monsterModel.insertMany(monsters);

    Logger.log(`✔️ ${monsters.length} monstres insérés`, this.SERVICE_NAME);
  }

  private mapMonster(entry: MonsterContent): Monster {
    let translations: Map<string, MonsterContent> = new Map();
    translations.set("en", entry);

    let monster: Monster = new Monster();

    monster.tag = 1;
    monster.languages = ["en"];
    monster.translations = translations;

    return monster;
  }

  private mapExternalMonster = async (entry: any): Promise<MonsterContent> => {
    const monstercontent: MonsterContent = new MonsterContent();

    monstercontent.srd = true;
    monstercontent.createdAt = new Date();
    monstercontent.updatedAt = new Date();
    monstercontent.name = entry.name;

    monstercontent.stats = this.convertStats(entry);
    const tempAffinities = new Affinities();
    Object.assign(tempAffinities, {
      resistances: entry.damage_resistances ?? [],
      immunities: entry.damage_immunities ?? [],
      vulnerabilities: entry.damage_vulnerabilities ?? [],
      conditionImmunities: (entry.condition_immunities ?? []).map((condition: any) => condition.name),
    });

    monstercontent.affinities = tempAffinities;
    monstercontent.abilities = this.mapAbilities(
      (entry.special_abilities ?? []).filter((a: any) => !a.name.includes(["Spellcasting", "Legendary Resistance"])),
    );

    monstercontent.spellcasting = await this.mapSpellcasting(
      (entry.special_abilities ?? []).find((a: any) => a.name === "Spellcasting"),
    );

    // Mapping des actions
    monstercontent.actions = this.mapActions(entry);

    let tempChallenge = new Challenge();
    tempChallenge.challengeRating = entry.challenge_rating ?? 0;
    tempChallenge.experiencePoints = entry.xp ?? 0;
    monstercontent.challenge = tempChallenge;

    let tempProfile = new Profile();
    tempProfile.type = entry.type ? entry.type.charAt(0).toUpperCase() + entry.type.slice(1).toLowerCase() : "Unknown";
    tempProfile.alignment = entry.alignment
      ? entry.alignment.charAt(0).toUpperCase() + entry.alignment.slice(1).toLowerCase()
      : "Unknown";
    tempProfile.subtype = entry.subtype
      ? entry.subtype.charAt(0).toUpperCase() + entry.subtype.slice(1).toLowerCase()
      : "Unknown";
    monstercontent.profile = tempProfile;

    return monstercontent;
  };

  private mapAbilities(traits: { name: string; desc: string }[]): { name: string; description: string }[] {
    return traits.map((trait) => ({
      name: trait.name,
      description: trait.desc,
    }));
  }

  private mapSavingThrows(entry) {
    const abilityKeys = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

    const result = {};

    for (const key of abilityKeys) {
      // Par défaut : calcul du bonus
      const baseModifier = Math.floor((entry[key] - 10) / 2);

      // Vérifie si une proficiency override est présente
      const prof = entry.proficiencies?.find((p) => p.proficiency.index === `saving-throw-${key.slice(0, 3)}`);

      result[key] = prof ? prof.value : baseModifier;
    }

    return Object.assign(new SavingThrows(), result);
  }

  private mapSkills(entry) {
    // Mapping skills => caractéristiques associées
    const skillToAbility = {
      athletics: "strength",
      acrobatics: "dexterity",
      sleightHand: "dexterity",
      stealth: "dexterity",
      arcana: "intelligence",
      history: "intelligence",
      investigation: "intelligence",
      nature: "intelligence",
      religion: "intelligence",
      animalHandling: "wisdom",
      insight: "wisdom",
      medicine: "wisdom",
      perception: "wisdom",
      survival: "wisdom",
      deception: "charisma",
      intimidation: "charisma",
      performance: "charisma",
      persuasion: "charisma",
    };

    const result = {};

    for (const skill in skillToAbility) {
      const ability = skillToAbility[skill];
      const baseModifier = Math.floor((entry[ability] - 10) / 2);

      // Chercher une proficiency explicite pour ce skill
      const prof = entry.proficiencies?.find((p) => p.proficiency.index === `skill-${skill.toLowerCase()}`);

      result[skill] = prof ? prof.value : baseModifier;
    }

    return Object.assign(new Skills(), result);
  }

  private mapSenses(entry): Sense[] {
    if (!entry.senses) return [];
    const senses: Sense[] = [];
    for (const [key, value] of Object.entries(entry.senses)) {
      if (key === "passive_perception") continue;
      senses.push(Object.assign(new Sense(), { type: key, value }));
    }
    return senses;
  }

  private parseSpeedValue(speed: { [key: string]: string } | string): Speed {
    if (typeof speed === "string") {
      return { walk: this.parseSpeedNumber(speed) };
    }
    const result: Speed = {};
    for (const [type, value] of Object.entries(speed)) {
      result[type as keyof Speed] = this.parseSpeedNumber(value);
    }
    return result;
  }

  private parseSpeedNumber(value: string): number {
    // Extract the first number found in the string (e.g., "30 ft." -> 30)
    if (typeof value !== "string") return 1;
    const match = value.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  private convertStats(entry: any): Stats {
    let stats = new Stats();

    switch (entry.size) {
      case "Tiny":
        stats.size = 0;
        break;
      case "Small":
        stats.size = 1;
        break;
      case "Medium":
        stats.size = 2;
        break;
      case "Large":
        stats.size = 3;
        break;
      case "Huge":
        stats.size = 4;
        break;
      case "Gargantuan":
        stats.size = 5;
        break;
      default:
        stats.size = 2;
    }

    stats.maxHitPoints = entry.hit_points ?? 0;
    stats.currentHitPoints = entry.hit_points ?? 0;
    stats.tempHitPoints = 0;
    stats.armorClass = entry.armor_class.value ?? 0;
    stats.passivePerception = entry.senses?.passive_perception ?? 0;

    stats.speed = this.parseSpeedValue(entry.speed);

    stats.languages =
      entry.languages.split(", ").map((lang: string) => lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()) ??
      [];

    stats.savingThrows = this.mapSavingThrows(entry);
    stats.skills = this.mapSkills(entry);
    stats.senses = this.mapSenses(entry);

    return stats;
  }

  private async mapSpellcasting(spellcasting: any) {
    if (!spellcasting) return [];
    if (Array.isArray(spellcasting)) {
      const all = await Promise.all(spellcasting.map((sc: any) => this.mapSpellcasting(sc)));
      return all.flat();
    }

    return [
      {
        ability: spellcasting.spellcasting.ability?.name,
        saveDC: spellcasting.spellcasting.dc,
        attackBonus: spellcasting.spellcasting.modifier,
        spellSlotsByLevel: this.mapSpellSlotsByLevel(spellcasting.spellcasting.slots),
        totalSlots: this.getTotalSpells(spellcasting.spellcasting.slots),
        spells: await this.mapSpells(spellcasting.spellcasting.spells),
      },
    ];
  }

  private mapSpellSlotsByLevel(spellSlotsByLevel) {
    if (!spellSlotsByLevel) return {};
    return Object.entries(spellSlotsByLevel).map(([level, count]) => ({
      level: Number(level),
      count: {
        total: Number(count),
        used: 0, // Default to 0 used slots
      },
    }));
  }

  private getTotalSpells(spellSlots: Record<string, number>): number {
    Logger.log(`Calculating total spells from slots: ${JSON.stringify(spellSlots)}`, this.SERVICE_NAME);
    return Object.values(spellSlots).reduce((total, count) => total + count, 0);
  }

  private async mapSpells(spells: any) {
    if (!spells) return [];

    const spellDocs = await Promise.all(
      spells.map(async (spell: any) => {
        const found = await this.spellModel.findOne({ "translations.en.name": spell.name }).lean();
        return found ? { spell: found._id } : null;
      }),
    );

    return spellDocs.filter(Boolean);
  }

  private mapAction(sourceAction: any): Action {
    const action = new Action();

    // Attributs de base
    action.name = sourceAction.name;
    action.description = sourceAction.desc;

    // Détermine le type d'action
    if (sourceAction.attack_bonus) {
      // Si on a un bonus d'attaque, c'est une attaque d'arme
      action.type = sourceAction.desc?.toLowerCase().includes("melee") ? "melee" : "ranged";
      action.attackBonus = sourceAction.attack_bonus;
    } else if (sourceAction.desc?.toLowerCase().includes("breath")) {
      action.type = "breath";
    } else {
      action.type = "ability"; // Action spéciale par défaut
    }

    // Gestion de la portée
    if (sourceAction.desc) {
      const rangeMatch = sourceAction.desc.match(/reach (\d+) ft\./);
      if (rangeMatch) {
        action.range = `${rangeMatch[1]} ft.`;
      }
    }

    // Gestion des dégâts
    action.damage = this.mapDamage(sourceAction.damage?.[0]);

    // Gestion du jet de sauvegarde
    if (sourceAction.dc) {
      const save = new Save();
      save.type = sourceAction.dc.dc_type.name.toLowerCase();
      save.dc = sourceAction.dc.dc_value;
      save.successType = sourceAction.dc.success_type;
      action.save = save;
    }

    // Gestion des conditions d'utilisation
    if (sourceAction.usage) {
      const usage = new Usage();
      usage.type = sourceAction.usage.type;
      usage.times = sourceAction.usage.times;
      usage.dice = sourceAction.usage.dice;
      usage.minValue = sourceAction.usage.min_value;
      action.usage = usage;
    }

    return action;
  }

  private mapDamage(sourceDamage: any): Damage {
    if (!sourceDamage) {
      return new Damage();
    }

    const damage = new Damage();
    damage.dice = sourceDamage.damage_dice;
    damage.type = sourceDamage.damage_type?.name?.toLowerCase();

    return damage;
  }

  private mapActions(entry: any): Actions {
    const actions = new Actions();

    // Conversion des actions standards
    actions.standard = (entry.actions || []).map((action) => {
      // Cas spécial pour les multiattacks
      if (action.multiattack_type === "actions") {
        return this.mapMultiAttack(action);
      }
      return this.mapAction(action);
    });

    // Conversion des actions légendaires
    actions.legendary = (entry.legendary_actions || []).map((legendaryAction) => {
      const action = this.mapAction(legendaryAction);
      action.type = "legendary";

      // Extraction du coût en actions si présent
      const costMatch = legendaryAction.name.match(/\(Costs (\d+) Actions?\)/i);
      if (costMatch) {
        action.name = legendaryAction.name.replace(/\(Costs \d+ Actions?\)/i, "").trim();
        action.legendaryActionCost = parseInt(costMatch[1], 10);
      } else {
        action.legendaryActionCost = 1; // Par défaut, une action légendaire coûte 1 point
      }

      return action;
    });

    // Définition du nombre d'actions légendaires par jour
    // La plupart des monstres ont 3 actions légendaires par tour, sauf indication contraire
    actions.legendaryActionsPerDay = entry.legendary_actions ? 3 : 0;

    // Conversion des réactions
    actions.reactions = (entry.reactions || []).map((reaction) => {
      const action = this.mapAction(reaction);
      action.type = "reaction";
      return action;
    });

    // Les actions de repaire et bonus ne sont pas présentes dans la source
    actions.lair = [];
    actions.bonus = [];

    return actions;
  }

  private mapMultiAttack(sourceAction: any): Action {
    const action = new Action();
    action.name = sourceAction.name;
    action.type = "multiattack";
    return action;
  }
}
