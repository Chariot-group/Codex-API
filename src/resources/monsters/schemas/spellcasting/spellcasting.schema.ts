import { Prop, Schema } from "@nestjs/mongoose";
import { SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { SpellFormattedDto } from "@/common/dtos/spell-formatted.dto";

@Schema({ _id: false })
export class Spellcasting {
  @ApiProperty({ example: "Intelligence", required: false, description: "Spellcasting ability" })
  @Prop()
  ability?: string;

  @ApiProperty({ example: 14, required: false, description: "Spell save DC" })
  @Prop()
  saveDC?: number;

  @ApiProperty({ example: 6, description: "Spell attack bonus" })
  @Prop()
  attackBonus: number;

  @ApiProperty({
    example: {
      "1": { total: 4, used: 1 },
      "2": { total: 3, used: 0 },
      "3": { total: 3, used: 1 },
    },
    required: false,
    description: "Spell slots by level with total and used counts",
  })
  @Prop({
    type: Map,
    of: new MongooseSchema(
      {
        total: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
      },
      { _id: false },
    ),
  })
  spellSlotsByLevel?: Map<string, { total?: number; used?: number }>;

  @ApiProperty({ example: 14, default: 0, description: "Total spell slots available" })
  @Prop({ default: 0 })
  totalSlots: number;

  @ApiProperty({
    type: [SpellFormattedDto],
    description:
      "Array of populated spell objects with full details (in API responses). Note: stored as ObjectIds in database.",
    example: [
      {
        srd: false,
        name: "Fireball",
        description: "A bright streak flashes from your pointing finger to a point you choose within range.",
        level: 3,
        castingTime: "1 action",
        range: "150 feet",
        components: ["V", "S", "M"],
        duration: "Instantaneous",
        school: "Evocation",
        effectType: 1,
        damage: "8d6",
      },
    ],
  })
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Spell" }], default: [] })
  spells: Types.ObjectId[];
}

export const SpellcastingSchema = SchemaFactory.createForClass(Spellcasting);
