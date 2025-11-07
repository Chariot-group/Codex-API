import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MonsterContent } from "@/resources/monsters/schemas/monster-content.schema";
import { MetaDataSchema } from "@/common/schemas/metadata.schema";
import mongoose from "mongoose";
import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";

@ApiExtraModels(MonsterContent)
@Schema({ timestamps: true })
export class Monster extends MetaDataSchema {
  /**
   *  Map de code ISO 2 → Schéma MonsterContent
   */
  @ApiProperty({
    type: "object",
    additionalProperties: { $ref: getSchemaPath(MonsterContent) },
  })
  @Prop({
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
    validate: {
      validator: function (map: Map<string, unknown>) {
        return Array.from(map.keys()).every((key) => /^[a-z]{2}$/.test(key));
      },
      message: "Each key must be a 2-letter ISO code in lowercase (e.g., fr, en, es).",
    },
  })
  translations: Map<string, MonsterContent>;

  @ApiProperty({ example: null })
  @Prop({ default: null })
  deletedAt?: Date;
}

export const MonsterSchema = SchemaFactory.createForClass(Monster);
