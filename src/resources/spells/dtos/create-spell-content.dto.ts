import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSpellContentDto {

    @ApiProperty({ example: "Fireball" })
    @IsString()
    name: string;

    @ApiProperty({ example: "A bright streak flashes from your pointing finger to a point you choose within range." })
    @IsString()
    description: string;

    @ApiProperty({ example: 3 })
    @IsNumber()
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

    @ApiProperty({ example: ["V", "S", "M"] })
    @IsString({ each: true })
    components: string[] = [];

    @ApiProperty({ example: "Instantaneous" })
    @IsString()
    @IsOptional()
    duration?: string;

    @ApiProperty({ example: 1 })
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