import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Speed {
  @Prop()
  walk?: number;

  @Prop()
  climb?: number;

  @Prop()
  swim?: number;

  @Prop()
  fly?: number;

  @Prop()
  burrow?: number;
}
export const SpeedSchema = SchemaFactory.createForClass(Speed);
