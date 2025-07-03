import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AbilityScores {
  @Prop({ default: 10 })
  strength: number;

  @Prop({ default: 10 })
  dexterity: number;

  @Prop({ default: 10 })
  constitution: number;

  @Prop({ default: 10 })
  intelligence: number;

  @Prop({ default: 10 })
  wisdom: number;

  @Prop({ default: 10 })
  charisma: number;
}

export const AbilityScoresSchema = SchemaFactory.createForClass(AbilityScores);
