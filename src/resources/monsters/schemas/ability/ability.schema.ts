import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Ability {
  @Prop()
  name: string;

  @Prop()
  description: string;
}

export const AbilitySchema = SchemaFactory.createForClass(Ability);
