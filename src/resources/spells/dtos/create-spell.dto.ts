import { CreateSpellContentDto } from "./create-spell-content.dto";

export class CreateSpellDto {
    languages: string[];
    translations: Map<string, CreateSpellContentDto>;
}
