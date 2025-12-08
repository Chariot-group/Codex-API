import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateSpellTranslationDto {
  @ApiProperty({ example: false, description: "Indicates if this translation is from SRD (only admins can set true)" })
  @IsBoolean()
  @IsOptional()
  srd?: boolean = false;

  @ApiProperty({ example: "Fireball" })
  @IsString()
  name: string;

  @ApiProperty({
    example: "A bright streak flashes from your pointing finger to a point you choose within range.",
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 3, description: "Spell level (0-9)" })
  @IsNumber()
  @Min(0)
  @Max(9)
  level: number;

  @ApiProperty({ example: "Evocation" })
  @IsString()
  @IsOptional()
  school?: string;

  @ApiProperty({ example: "1 action" })
  @IsString()
  @IsOptional()
  castingTime?: string;

  @ApiProperty({ example: "150 feet" })
  @IsString()
  @IsOptional()
  range?: string;

  @ApiProperty({
    example: ["V", "S", "M"],
    description: "Spell components. Can be localized (e.g., V/S/M in English, P/G/C in French). Maximum 3 components.",
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(3, { message: "Components array cannot have more than 3 elements" })
  components: string[] = [];

  @ApiProperty({ example: "Instantaneous" })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  effectType?: number;

  @ApiProperty({ example: "8d6" })
  @IsString()
  @IsOptional()
  damage?: string;

  @ApiProperty({ example: "Heal 4d8 + spellcasting modifier" })
  @IsString()
  @IsOptional()
  healing?: string;
}
