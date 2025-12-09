import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class DeleteTranslationParamDto {
  @ApiProperty({
    description: "The ISO 2 code of the language to delete",
    example: "fr",
  })
  @IsString()
  @Matches(/^[a-z]{2}$/, {
    message: "Language must be a 2-letter ISO code in lowercase (e.g., fr, en, es)",
  })
  lang: string;
}

export class DeleteTranslationResponseDto {
  @ApiProperty({
    description: "The ID of the monster",
    example: "507f1f77bcf86cd799439011",
  })
  monsterId: string;

  @ApiProperty({
    description: "The language code that was deleted",
    example: "fr",
  })
  deletedLang: string;

  @ApiProperty({
    description: "Remaining languages after deletion",
    example: ["en", "es"],
    type: [String],
  })
  remainingLanguages: string[];
}
