import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SpellContent } from "@/resources/spells/schemas/spell-content.schema";
import { MetaDataSchema } from "@/common/schemas/metadata.schema";
import mongoose from "mongoose";
import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";

@ApiExtraModels(SpellContent)
@Schema({ timestamps: true })
export class Spell extends MetaDataSchema {
  /**
   *  All translations
   * @type Map<String, SpelleContent>
   */
  @ApiProperty({
    type: "object",
    additionalProperties: { $ref: getSchemaPath(SpellContent) },
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
  translations: Map<string, SpellContent>;

  @ApiProperty({ example: null })
  @Prop({ default: null })
  deletedAt?: Date;
}

export const SpellSchema = SchemaFactory.createForClass(Spell);
