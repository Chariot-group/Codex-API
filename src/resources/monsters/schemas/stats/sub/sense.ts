import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';

@Schema({ _id: false })
export class Sense {
  @IsOptional()
  @Prop({ type: String, default: '' })
  name: string;

  @IsOptional()
  @Prop({ type: Number, default: 0 })
  value: number;
}

export const SenseSchema = SchemaFactory.createForClass(Sense);
