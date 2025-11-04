import { IsIn, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateSpellDto {

    @ApiProperty({ example: 1, description: "0: Homebrew, 1: Certified by Chariot", enum: [0, 1] })
    @IsIn([0, 1])
    tag: 0 | 1;
}
