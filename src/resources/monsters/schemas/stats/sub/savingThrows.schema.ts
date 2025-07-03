import { Prop, SchemaFactory } from '@nestjs/mongoose';

import { Schema } from '@nestjs/mongoose';
@Schema({ _id: false })
export class SavingThrows {
  @Prop({ default: 0 })
  strength: number;

  @Prop({ default: 0 })
  dexterity: number;

  @Prop({ default: 0 })
  constitution: number;

  @Prop({ default: 0 })
  intelligence: number;

  @Prop({ default: 0 })
  wisdom: number;

  @Prop({ default: 0 })
  charisma: number;
}

export const SavingThrowsSchema = SchemaFactory.createForClass(SavingThrows);
