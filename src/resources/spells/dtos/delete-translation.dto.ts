import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class DeleteTranslationParamDto {
  @ApiProperty({
    description: "The ISO 2-letter code of the language to delete",
    example: "fr",
  })
  @IsString()
  @Matches(/^[a-z]{2}$/, {
    message: "Language must be a 2-letter ISO code in lowercase (e.g., fr, en, es)",
  })
  lang: string;
}

export class DeleteTranslationResponseDto {
  @ApiProperty({ example: "Translation 'fr' for spell #507f1f77bcf86cd799439011 deleted successfully" })
  message: string;

  @ApiProperty({ example: "fr" })
  deletedLanguage: string;

  @ApiProperty({ example: ["en", "es"], type: [String] })
  remainingLanguages: string[];
}
