import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Spellcontent, SpellContentSchema } from "./spell-content.schema";
import { MetaDataSchema } from "@/common/schemas/metadata.schema";
import mongoose from "mongoose";

@Schema({timestamps: true})
export class Spell extends MetaDataSchema {

  /**
   *  Map de code ISO 3 → Schéma générique T
   */
  @Prop({
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
    validate: {
      validator: function (map: Map<string, unknown>) {
        return Array.from(map.keys()).every((key) => /^[a-z]{2}$/.test(key));
      },
      message: "Each key must be a 2-letter ISO code in lowercase (e.g., fr, en, es)."
    }
  })
  translations: Map<string, Spellcontent>;

  @Prop({ default: null })
  deletedAt?: Date;

}

export const SpellSchema = SchemaFactory.createForClass(Spell);

