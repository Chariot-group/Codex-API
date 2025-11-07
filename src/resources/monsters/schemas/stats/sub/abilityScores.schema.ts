import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema({ _id: false })
export class AbilityScores {
  @ApiProperty({ example: 8 })
  @Prop({ default: 10 })
  strength: number;

  @ApiProperty({ example: 18 })
  @Prop({ default: 10 })
  dexterity: number;

  @ApiProperty({ example: 14 })
  @Prop({ default: 10 })
  constitution: number;

  @ApiProperty({ example: 12 })
  @Prop({ default: 10 })
  intelligence: number;

  @ApiProperty({ example: 10 })
  @Prop({ default: 10 })
  wisdom: number;

  @ApiProperty({ example: 14 })
  @Prop({ default: 10 })
  charisma: number;
}

export const AbilityScoresSchema = SchemaFactory.createForClass(AbilityScores);
