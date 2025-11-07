import { Prop, SchemaFactory } from "@nestjs/mongoose";

import { Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
@Schema({ _id: false })
export class SavingThrows {
  @ApiProperty({ example: -1 })
  @Prop({ default: 0 })
  strength: number;

  @ApiProperty({ example: 4 })
  @Prop({ default: 0 })
  dexterity: number;

  @ApiProperty({ example: 2 })
  @Prop({ default: 0 })
  constitution: number;

  @ApiProperty({ example: 1 })
  @Prop({ default: 0 })
  intelligence: number;

  @ApiProperty({ example: 0 })
  @Prop({ default: 0 })
  wisdom: number;

  @ApiProperty({ example: 2 })
  @Prop({ default: 0 })
  charisma: number;
}

export const SavingThrowsSchema = SchemaFactory.createForClass(SavingThrows);
