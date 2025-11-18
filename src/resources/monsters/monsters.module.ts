import { Module } from "@nestjs/common";
import { MonstersService } from "@/resources/monsters//monsters.service";
import { MonstersController } from "@/resources/monsters//monsters.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Monster, MonsterSchema } from "@/resources/monsters/schemas/monster.schema";
import { Spell, SpellSchema } from "@/resources/spells/schemas/spell.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Monster.name, schema: MonsterSchema },
      { name: Spell.name, schema: SpellSchema },
    ]),
  ],
  controllers: [MonstersController],
  providers: [MonstersService],
})
export class MonstersModule {}
