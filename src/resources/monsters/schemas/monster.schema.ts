import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Affinities } from "@/resources/monsters/schemas/affinities/affinities.schema";
import { Ability } from "@/resources/monsters/schemas/ability/ability.schema";
import { Spellcasting } from "@/resources/monsters/schemas/spellcasting/spellcasting.schema";
import { Stats } from "@/resources/monsters/schemas/stats/stats.schema";
import { MetaDataSchema } from "@/common/schemas/metadata.schema";

export type MonsterDocument = Monster & Document;

@Schema({ timestamps: true })
export class Monster extends MetaDataSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: mongoose.Schema.Types.ObjectId;

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

  @Prop({ default: null })
  deletedAt?: Date;
}

export const MonsterSchema = SchemaFactory.createForClass(Monster);
