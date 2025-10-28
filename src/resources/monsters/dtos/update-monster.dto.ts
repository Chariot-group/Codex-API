import { PartialType } from "@nestjs/mapped-types";
import { CreateMonsterDto } from "@/resources/monsters/dtos/create-monster.dto";

export class UpdateMonsterDto extends PartialType(CreateMonsterDto) {}
