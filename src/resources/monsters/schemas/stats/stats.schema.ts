import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";
import { Speed } from "@/resources/monsters/schemas/stats/sub/speed.schema";
import { AbilityScores } from "@/resources/monsters/schemas/stats/sub/abilityScores.schema";
import { SavingThrows } from "@/resources/monsters/schemas/stats/sub/savingThrows.schema";
import { Skills } from "@/resources/monsters/schemas/stats/sub/skill.schema";
import { Sense } from "@/resources/monsters/schemas/stats/sub/sense";
import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";

@ApiExtraModels(Speed, AbilityScores, SavingThrows, Skills, Sense)
@Schema({ _id: false })
export class Stats {
  @ApiProperty({ example: 3 })
  @Prop({ default: 0 })
  size: number;

  @ApiProperty({ example: 100 })
  @Prop({ default: 0 })
  maxHitPoints: number;

  @ApiProperty({ example: 95 })
  @Prop({
    default: function () {
      return this.maxHitPoints;
    },
  })
  currentHitPoints: number;

  @ApiProperty({ example: 7 })
  @Prop({ default: 0 })
  tempHitPoints: number;

  @ApiProperty({ example: 15 })
  @Prop({ default: 10 })
  armorClass: number;

  @ApiProperty({ type: () => Speed })
  @Prop({ type: Speed, default: {} })
  speed: Speed;

  @ApiProperty({ type: () => AbilityScores })
  @Prop({ type: AbilityScores, default: {} })
  abilityScores: AbilityScores;

  @ApiProperty({ type: () => [String], example: ["Common", "Elvish"] })
  @Prop({ type: [String], default: [] })
  languages: string[];

  @ApiProperty({ example: 12 })
  @Prop({ default: 0 })
  passivePerception: number;

  @ApiProperty({ type: () => SavingThrows })
  @Prop({ type: SavingThrows, default: {} })
  savingThrows: SavingThrows;

  @ApiProperty({ type: () => Skills })
  @Prop({ type: Skills, default: {} })
  skills: Skills;

  @ApiProperty({ type: () => [Sense] })
  @Prop({ type: [Sense], default: [] })
  senses: Sense[];
}

export const StatsSchema = SchemaFactory.createForClass(Stats);
