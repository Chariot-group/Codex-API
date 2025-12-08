import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsArray, Min, Max, IsIn } from "class-validator";

/**
 * DTO for updating a spell translation (partial update)
 * The `srd` field is intentionally omitted to prevent unauthorized modifications
 */
export class UpdateSpellTranslationDto {
  @ApiPropertyOptional({ example: "Fireball", description: "The name of the spell" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: "A bright streak flashes from your pointing finger to a point you choose within range.",
    description: "The description of the spell",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 3, description: "Spell level (0-9)", minimum: 0, maximum: 9 })
  @IsNumber()
  @Min(0)
  @Max(9)
  @IsOptional()
  level?: number;

  @ApiPropertyOptional({ example: "Evocation", description: "The school of magic" })
  @IsString()
  @IsOptional()
  school?: string;

  @ApiPropertyOptional({ example: "1 action", description: "The casting time of the spell" })
  @IsString()
  @IsOptional()
  castingTime?: string;

  @ApiPropertyOptional({ example: "150 feet", description: "The range of the spell" })
  @IsString()
  @IsOptional()
  range?: string;

  @ApiPropertyOptional({
    example: ["V", "S", "M"],
    description: "Spell components (V = Verbal, S = Somatic, M = Material)",
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsIn(["V", "S", "M"], { each: true })
  @IsOptional()
  components?: string[];

  @ApiPropertyOptional({ example: "Instantaneous", description: "The duration of the spell" })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional({ example: 1, description: "The effect type of the spell" })
  @IsNumber()
  @IsOptional()
  effectType?: number;

  @ApiPropertyOptional({ example: "8d6", description: "The damage of the spell" })
  @IsString()
  @IsOptional()
  damage?: string;

  @ApiPropertyOptional({ example: "Heal 4d8 + spellcasting modifier", description: "The healing of the spell" })
  @IsString()
  @IsOptional()
  healing?: string;
}
