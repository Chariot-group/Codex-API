import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";
import { Speed } from "@/resources/monsters/schemas/stats/sub/speed.schema";
import { AbilityScores } from "@/resources/monsters/schemas/stats/sub/abilityScores.schema";
import { SavingThrows } from "@/resources/monsters/schemas/stats/sub/savingThrows.schema";
import { Skills } from "@/resources/monsters/schemas/stats/sub/skill.schema";
import { SIZES, Size } from "@/resources/monsters/constants/sizes.constant";
import { Sense } from "@/resources/monsters/schemas/stats/sub/sense";

@Schema({ _id: false })
export class Stats {
  @Prop({
    type: String,
    required: true,
    enum: SIZES,
  })
  size: Size;

  @Prop({ default: 0 })
  maxHitPoints: number;

  @Prop({
    default: function () {
      return this.maxHitPoints;
    },
  })
  currentHitPoints: number;

  @Prop({ default: 0 })
  tempHitPoints: number;

  @Prop({ default: 0 })
  armorClass: number;

  @Prop({ type: Speed, default: {} })
  speed: Speed;

  @Prop({ type: AbilityScores, default: {} })
  abilityScores: AbilityScores;

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ default: 0 })
  passivePerception: number;

  @Prop({ type: SavingThrows, default: {} })
  savingThrows: SavingThrows;

  @Prop({ type: Skills, default: {} })
  skills: Skills;

  @Prop({ type: [Sense], default: [] })
  senses: Sense[];
}

export const StatsSchema = SchemaFactory.createForClass(Stats);
