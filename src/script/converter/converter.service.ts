import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { Model } from "mongoose";
import { EffectType } from "@/resources/spells/constants/effect-types.constant";
import { readFile } from "fs/promises";

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
    const spells: Partial<Spell>[] = rawData.map(this.mapExternalSpell);

    Logger.log(`Insertion en base...`, this.SERVICE_NAME);
    await this.spellModel.insertMany(spells);
    Logger.log(`✔️ ${spells.length} sorts insérés`, this.SERVICE_NAME);
  }

  private mapExternalSpell(entry: any): Partial<Spell> {
    const baseDamage = entry.damage?.damage_at_slot_level?.["2"] ?? entry.damage?.damage_at_character_level?.["1"];
    const healing = entry.heal_at_slot_level?.["2"];

    let effectType: EffectType;

    if (baseDamage) {
      effectType = "attack";
    } else if (healing) {
      effectType = "heal";
    } else {
      effectType = "utility";
    }

    return {
      name: entry.name,
      level: entry.level,
      school: entry.school?.name,
      description: (entry.desc ?? []).join("\n\n"),
      components: entry.components ?? [],
      castingTime: entry.casting_time,
      duration: entry.duration,
      range: entry.range,
      effectType,
      damage: baseDamage,
      healing,
    };
  }
}
