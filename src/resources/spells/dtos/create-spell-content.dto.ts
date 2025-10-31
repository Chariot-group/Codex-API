import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSpellContentDto {

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    level: number;

    @IsString()
    @IsOptional()
    school?: string;

    @IsString()
    @IsOptional()
    castingTime?: string;

    @IsString()
    @IsOptional()
    range?: string;

    @IsString({ each: true })
    components: string[];

    @IsString()
    @IsOptional()
    duration?: string;

    @IsNumber()
    @IsOptional()
    effectType?: number;

    @IsString()
    @IsOptional()
    damage?: string;

    @IsString()
    @IsOptional()
    healing?: string;
}