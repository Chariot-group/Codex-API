import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Affinities } from "@/resources/monsters/schemas/affinities/affinities.schema";
import { Ability } from "@/resources/monsters/schemas/ability/ability.schema";
import { Spellcasting } from "@/resources/monsters/schemas/spellcasting/spellcasting.schema";
import { Stats } from "@/resources/monsters/schemas/stats/stats.schema";

@Schema()
export class Monstercontent {

  @Prop({ required: true, default: true })
  srd: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop({ default: new Date() })
  createdAt?: Date;

  @Prop({ default: new Date() })
  updatedAt?: Date;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Stats, default: {} })
  stats: Stats;

  @Prop({ type: Affinities, default: {} })
  affinities: Affinities;

  @Prop({ type: [Ability], default: [] })
  abilities: Ability[];

  @Prop({ type: [Spellcasting], default: [] })
  spellcasting: Spellcasting[];

}

export const MonsterContentSchema = SchemaFactory.createForClass(Monstercontent);