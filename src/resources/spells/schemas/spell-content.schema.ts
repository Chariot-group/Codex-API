import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Spellcontent {

  @Prop({ required: true, default: true })
  srd: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop({ default: new Date() })
  createdAt?: Date;

  @Prop({ default: new Date() })
  updatedAt?: Date;

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

  @Prop({ default: 0 })
  effectType?: number;

  @Prop()
  damage?: string;

  @Prop()
  healing?: string;

}

export const SpellContentSchema = SchemaFactory.createForClass(Spellcontent);
