import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { EffectType } from "@/resources/spells/constants/effect-types.constant";
import { MetaDataSchema } from "@/common/schemas/metadata.schema";

@Schema({ _id: false })
export class Spell extends MetaDataSchema {
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
  @Prop({ default: [] })
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

  @ApiProperty({ example: "DAMAGE" })
  @Prop()
  effectType?: EffectType;

  @ApiProperty({ example: "8d6" })
  @Prop()
  damage?: string;

  @ApiProperty({ example: null })
  @Prop()
  healing?: string;
}

export const SpellSchema = SchemaFactory.createForClass(Spell);
