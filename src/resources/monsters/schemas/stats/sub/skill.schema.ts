import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Skills {
  @Prop({ default: 0 })
  athletics: number;

  @Prop({ default: 0 })
  acrobatics: number;

  @Prop({ default: 0 })
  sleightHand: number;

  @Prop({ default: 0 })
  stealth: number;

  @Prop({ default: 0 })
  arcana: number;

  @Prop({ default: 0 })
  history: number;

  @Prop({ default: 0 })
  investigation: number;

  @Prop({ default: 0 })
  nature: number;

  @Prop({ default: 0 })
  religion: number;

  @Prop({ default: 0 })
  animalHandling: number;

  @Prop({ default: 0 })
  insight: number;

  @Prop({ default: 0 })
  medicine: number;

  @Prop({ default: 0 })
  perception: number;

  @Prop({ default: 0 })
  survival: number;

  @Prop({ default: 0 })
  deception: number;

  @Prop({ default: 0 })
  intimidation: number;

  @Prop({ default: 0 })
  performance: number;

  @Prop({ default: 0 })
  persuasion: number;
}

export const SkillsSchema = SchemaFactory.createForClass(Skills);
