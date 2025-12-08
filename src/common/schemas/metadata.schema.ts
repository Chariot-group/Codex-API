import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema()
export class MetaDataSchema {
  /**
   * O: homebrew, 1: Certified by Chariot
   * @type number
   */
  @ApiProperty({ example: 1 })
  @Prop({ required: true, default: 0 })
  tag: number;

  /**
   * All availables translations
   * @type String[]
   */
  @ApiProperty({ example: ["en"], type: [String] })
  @Prop({
    type: [String],
    default: [],
    validate: {
      validator: function (languages: string[]) {
        return Array.isArray(languages) && languages.every((lang) => /^[a-z]{2}$/.test(lang));
      },
      message: "Each language must be a 2-letter ISO code in lowercase (e.g., FRA, USA, DEU).",
    },
  })
  languages: string[];
}
