import { DtoMapper } from "@/common/mappers/common.mapper";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { CreateSpellDto } from "@/resources/spells/dtos/create-spell.dto";
import { SpellContent } from "@/resources/spells/schemas/spell-content.schema";
import { CreateSpellContentDto } from "@/resources/spells/dtos/create-spell-content.dto";

export class SpellsMapper extends DtoMapper<Spell> {

    /**
     * Convert CreateSpellDto to Spell entity
     * @param dto CreateSpellDto source
     * @returns Spell entity
     */
    dtoToEntity(dto: CreateSpellDto): Spell {
        const spell: Spell = new Spell();

        spell.translations = new Map<string, SpellContent>();
        let spellContent: SpellContent = this.dtoSpellContentToEntity(dto.spellContent);

        spell.translations.set(dto.lang, spellContent);
        spell.languages = [dto.lang];
        
        spell.tag = 0;

        return spell;
    }

    /**
     * Convert CreateSpellContentDto to SpellContent entity
     * @param dto CreateSpellContentDto source
     * @returns SpellContent entity
     */
    dtoSpellContentToEntity(dto: CreateSpellContentDto): SpellContent {
        const spellContent: SpellContent = new SpellContent();

        spellContent.srd = false;
        spellContent.name = dto.name;
        spellContent.description = dto.description;
        spellContent.level = dto.level;
        spellContent.castingTime = dto.castingTime;
        spellContent.range = dto.range;
        spellContent.components = dto.components;
        spellContent.duration = dto.duration;
        spellContent.school = dto.school;
        spellContent.effectType = dto.effectType;
        spellContent.damage = dto.damage;
        spellContent.healing = dto.healing;

        return spellContent;
    }
}
