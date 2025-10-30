import { Module } from "@nestjs/common";
import { ConverterService } from "@/script/converter/converter.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Spell, SpellSchema } from "@/resources/spells/schemas/spell.schema";
import { Monster, MonsterSchema } from "@/resources/monsters/schemas/monster.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Spell.name, schema: SpellSchema },
      { name: Monster.name, schema: MonsterSchema },
    ]),
  ],
  providers: [ConverterService],
  exports: [ConverterService],
})
export class ConverterModule {}
