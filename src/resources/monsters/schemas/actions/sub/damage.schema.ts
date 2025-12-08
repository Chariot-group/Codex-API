import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ _id: false })
export class Damage {
  @Prop()
  dice?: string;

  @Prop()
  type?: string;
}

export const DamageSchema = SchemaFactory.createForClass(Damage);
