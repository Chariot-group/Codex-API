import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

@Schema({ _id: false })
export class Sense {
  @ApiProperty({ example: "darkvision" })
  @IsOptional()
  @Prop({ type: String, default: "" })
  name: string;

  @ApiProperty({ example: 60 })
  @IsOptional()
  @Prop({ type: Number, default: 0 })
  value: number;
}

export const SenseSchema = SchemaFactory.createForClass(Sense);
