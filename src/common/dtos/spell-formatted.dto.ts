import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO representing a formatted spell for API responses
 */
export class SpellFormattedDto {
  @ApiProperty({ example: false, description: "Whether the spell is from SRD" })
  srd: boolean;

  @ApiProperty({ example: "Fireball", description: "Name of the spell" })
  name: string;

  @ApiProperty({
    example: "A bright streak flashes from your pointing finger to a point you choose within range.",
    description: "Description of the spell",
  })
  description: string;

  @ApiProperty({ example: 3, description: "Spell level (0 for cantrips)" })
  level: number;

  @ApiProperty({ example: "1 action", description: "Casting time", required: false })
  castingTime?: string;

  @ApiProperty({ example: "150 feet", description: "Range", required: false })
  range?: string;

  @ApiProperty({ type: [String], example: ["V", "S", "M"], description: "Required components" })
  components: string[];

  @ApiProperty({ example: "Instantaneous", description: "Duration", required: false })
  duration?: string;

  @ApiProperty({ example: "Evocation", description: "School of magic", required: false })
  school?: string;

  @ApiProperty({ example: 1, description: "Effect type", required: false })
  effectType?: number;

  @ApiProperty({ example: "8d6", description: "Damage dice", required: false })
  damage?: string;

  @ApiProperty({ example: "Heal 4d8 + spellcasting modifier", description: "Healing", required: false })
  healing?: string;
}
