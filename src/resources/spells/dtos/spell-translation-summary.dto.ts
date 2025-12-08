import { ApiProperty } from "@nestjs/swagger";

export class SpellTranslationSummaryDto {
  @ApiProperty({ example: "en", description: "ISO 2 letters language code" })
  lang: string;

  @ApiProperty({ example: true, description: "Whether this translation is from SRD" })
  srd: boolean;

  @ApiProperty({ example: "Fireball", description: "Name of the spell in this language" })
  name: string;

  @ApiProperty({ example: new Date(), description: "Creation date of this translation" })
  createdAt?: Date;

  @ApiProperty({ example: new Date(), description: "Last update date of this translation" })
  updatedAt?: Date;
}

export class SpellTranslationsListDto {
  @ApiProperty({ example: "507f1f77bcf86cd799439011", description: "Spell ID" })
  spellId: string;

  @ApiProperty({ example: 1, description: "Spell tag" })
  tag: number;

  @ApiProperty({ type: [SpellTranslationSummaryDto], description: "List of available translations" })
  translations: SpellTranslationSummaryDto[];
}
