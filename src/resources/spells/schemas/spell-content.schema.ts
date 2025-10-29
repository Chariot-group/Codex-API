import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema()
export class SpellContent {

  @ApiProperty({ example: true })
  @Prop({ required: true, default: true })
  srd: boolean;

  @ApiProperty({ example: null })
  @Prop({ default: null })
  deletedAt?: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ default: new Date() })
  createdAt?: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ default: new Date() })
  updatedAt?: Date;

  @ApiProperty({ example: "Fireball" })
  @Prop()
  name?: string;

  @ApiProperty({ example: 3 })
  @Prop()
  level?: number;

  @ApiProperty({ example: "Evocation" })
  @Prop()
  school?: string;

  @ApiProperty({ example: "A bright streak flares from your pointing finger..." })
  @Prop()
  description?: string;

  @ApiProperty({ type: [String], example: ["V", "S", "M"] })
  @Prop({ default: [], maxLength: 3 })
  components: string[];

  @ApiProperty({ example: "1 action" })
  @Prop()
  castingTime?: string;

  @ApiProperty({ example: "Instantaneous" })
  @Prop()
  duration?: string;

  @ApiProperty({ example: "150 feet" })
  @Prop()
  range?: string;

  @ApiProperty({ example: 0 })
  @Prop()
  effectType?: number;

  @ApiProperty({ example: "8d6" })
  @Prop()
  damage?: string;

  @ApiProperty({ example: null })
  @Prop()
  healing?: string;

}

export const SpellContentSchema = SchemaFactory.createForClass(SpellContent);
