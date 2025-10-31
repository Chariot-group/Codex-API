import { DtoMapper } from "@/common/mappers/common.mapper";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { CreateSpellDto } from "@/resources/spells/dtos/create-spell.dto";
import { SpellContent } from "@/resources/spells/schemas/spell-content.schema";
import { CreateSpellContentDto } from "@/resources/spells/dtos/create-spell-content.dto";

export class SpellsMapper extends DtoMapper<Spell> {

    dtoToEntity(dto: CreateSpellDto): Spell {
        const spell = new Spell();

        spell.languages = dto.languages;

        spell.translations = new Map<string, SpellContent>();
        dto.translations.forEach((value: CreateSpellContentDto, key: string) => {
            const spellContent = this.dtoSpellContentToEntity(value);
            spell.translations.set(key, spellContent);
        });
        
        spell.tag = 0;

        return spell;
    }

    dtoSpellContentToEntity(dto: CreateSpellContentDto): SpellContent {
        const spellContent = new SpellContent();

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
