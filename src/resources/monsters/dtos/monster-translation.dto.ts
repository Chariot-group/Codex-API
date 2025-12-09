import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

/**
 * DTO for listing translation summaries of a monster
 * Contains basic metadata for each available translation
 */
export class MonsterTranslationSummaryDto {
  @ApiProperty({ example: "en", description: "ISO 2-letter language code" })
  lang: string;

  @ApiProperty({ example: true, description: "Whether this is SRD content" })
  srd: boolean;

  @ApiProperty({ example: "Goblin", description: "Monster name in this language" })
  name: string;

  @ApiProperty({ example: null, description: "Deletion date if archived" })
  deletedAt?: Date;

  @ApiProperty({ example: new Date(), description: "Creation date of this translation" })
  createdAt?: Date;

  @ApiProperty({ example: new Date(), description: "Last update date of this translation" })
  updatedAt?: Date;
}

/**
 * DTO for the lang path parameter
 */
export class LangParamDto {
  @ApiProperty({
    example: "fr",
    description: "ISO 2-letter language code (e.g., en, fr, es, de)",
  })
  @IsString()
  @Matches(/^[a-z]{2}$/, {
    message: "Language must be a 2-letter ISO code in lowercase (e.g., en, fr, es)",
  })
  lang: string;
}
