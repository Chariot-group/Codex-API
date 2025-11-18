import { PartialType } from "@nestjs/mapped-types";
import { CreateMonsterDto } from "@/resources/monsters/dtos/create-monster.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class UpdateMonsterDto extends PartialType(CreateMonsterDto) {
  @ApiProperty({ example: 1, description: "0: Homebrew, 1: Certified by Chariot", enum: [0, 1] })
  @IsIn([0, 1])
  tag: 0 | 1;
}
