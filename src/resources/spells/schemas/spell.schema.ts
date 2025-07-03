import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { EffectType } from "@/resources/spells/constants/effect-types.constant";
import { MetaDataSchema } from "@/common/schemas/metadata.schema";

@Schema({ _id: false })
export class Spell extends MetaDataSchema {
  @Prop()
  name?: string;

  @Prop()
  level?: number;

  @Prop()
  school?: string;

  @Prop()
  description?: string;

  @Prop({ default: [] })
  components: string[];

  @Prop()
  castingTime?: string;

  @Prop()
  duration?: string;

  @Prop()
  range?: string;

  @Prop()
  effectType?: EffectType;

  @Prop()
  damage?: string;

  @Prop()
  healing?: string;
}

export const SpellSchema = SchemaFactory.createForClass(Spell);
