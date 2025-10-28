import { PartialType } from "@nestjs/mapped-types";
import { CreateSpellDto } from "@/resources/spells/dtos/create-spell.dto";

export class UpdateSpellDto extends PartialType(CreateSpellDto) {}
