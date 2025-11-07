import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema({ _id: false })
export class Skills {
  @ApiProperty({ example: 3 })
  @Prop({ default: 0 })
  athletics: number;

  @ApiProperty({ example: 2 })
  @Prop({ default: 0 })
  acrobatics: number;

  @ApiProperty({ example: 3 })
  @Prop({ default: 0 })
  sleightHand: number;

  @ApiProperty({ example: -1 })
  @Prop({ default: 0 })
  stealth: number;

  @ApiProperty({ example: 0 })
  @Prop({ default: 0 })
  arcana: number;

  @ApiProperty({ example: 5 })
  @Prop({ default: 0 })
  history: number;

  @ApiProperty({ example: 2 })
  @Prop({ default: 0 })
  investigation: number;

  @ApiProperty({ example: 0 })
  @Prop({ default: 0 })
  nature: number;

  @ApiProperty({ example: 7 })
  @Prop({ default: 0 })
  religion: number;

  @ApiProperty({ example: 3 })
  @Prop({ default: 0 })
  animalHandling: number;

  @ApiProperty({ example: -1 })
  @Prop({ default: 0 })
  insight: number;

  @ApiProperty({ example: 1 })
  @Prop({ default: 0 })
  medicine: number;

  @ApiProperty({ example: 7 })
  @Prop({ default: 0 })
  perception: number;

  @ApiProperty({ example: 2 })
  @Prop({ default: 0 })
  survival: number;

  @ApiProperty({ example: 2 })
  @Prop({ default: 0 })
  deception: number;

  @ApiProperty({ example: 2 })
  @Prop({ default: 0 })
  intimidation: number;

  @ApiProperty({ example: 1 })
  @Prop({ default: 0 })
  performance: number;

  @ApiProperty({ example: 2 })
  @Prop({ default: 0 })
  persuasion: number;
}

export const SkillsSchema = SchemaFactory.createForClass(Skills);
