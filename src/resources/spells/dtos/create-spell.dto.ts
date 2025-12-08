import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CreateSpellContentDto } from "@/resources/spells/dtos/create-spell-content.dto";
import { IsString, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@ApiExtraModels(CreateSpellContentDto)
export class CreateSpellDto {
  @ApiProperty({ example: "en" })
  @IsString()
  @Matches(/^[a-z]{2}$/, {
    message: "lang must be a 2-letter ISO code in lowercase (e.g., fr, en, es).",
  })
  lang: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateSpellContentDto)
  spellContent: CreateSpellContentDto;
}
