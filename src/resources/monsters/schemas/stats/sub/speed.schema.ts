import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema({ _id: false })
export class Speed {
  @ApiProperty({ example: 30 })
  @Prop()
  walk?: number;

  @ApiProperty({ example: 20 })
  @Prop()
  climb?: number;

  @ApiProperty({ example: 15 })
  @Prop()
  swim?: number;

  @ApiProperty({ example: 60 })
  @Prop()
  fly?: number;

  @ApiProperty({ example: 10 })
  @Prop()
  burrow?: number;
}
export const SpeedSchema = SchemaFactory.createForClass(Speed);
