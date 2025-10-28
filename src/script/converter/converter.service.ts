import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { readFile } from "fs/promises";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { Spellcontent } from "@/resources/spells/schemas/spell-content.schema";
import e from "express";
@Injectable()
export class ConverterService {
  readonly SERVICE_NAME = this.constructor.name;

  constructor(@InjectModel(Spell.name) private readonly spellModel: Model<Spell>) {}

  async launch(resource: string): Promise<void> {
    const inputPath = `./src/script/output/${resource}.json`;

    Logger.log(`Lecture depuis ${inputPath}...`, this.SERVICE_NAME);
    const file = await readFile(inputPath, "utf-8");
    const rawData = JSON.parse(file);

    Logger.log(`Conversion de ${rawData.length} sorts...`, this.SERVICE_NAME);
    const spellContents: Partial<Spellcontent>[] = rawData.map(this.mapExternalSpell);

    const spells : Spell[] = spellContents.map(this.mapSpell);

    Logger.log(`Insertion en base...`, this.SERVICE_NAME);
    await this.spellModel.insertMany(spells);
    Logger.log(`✔️ ${spells.length} sorts insérés`, this.SERVICE_NAME);
  }

  private mapExternalSpell(entry: any): Partial<Spellcontent> {
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

    let spellcontent: Spellcontent = new Spellcontent()

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

  private mapSpell(entry: Spellcontent): Spell {

    let translations : Map<string, Spellcontent> = new Map();
    translations.set("en", entry);

    let spell: Spell = new Spell();

    spell.tag = 1;
    spell.languages = ["en"];
    spell.translations = translations;
    
    return spell;
  }
}
