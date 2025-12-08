import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Monster } from "@/resources/monsters/schemas/monster.schema";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { Model, Types } from "mongoose";
import { PaginationMonster } from "@/resources/monsters/dtos/find-all.dto";
import { MonsterContent } from "@/resources/monsters/schemas/monster-content.schema";
import { MonstersMapper } from "@/resources/monsters/mappers/monsters.mapper";
import { CreateMonsterDto } from "@/resources/monsters/dtos/create-monster.dto";
import { CreateMonsterTranslationDto } from "@/resources/monsters/dtos/create-monster-translation.dto";
import { IResponse } from "@/common/dtos/reponse.dto";
import { SpellFormattedDto } from "@/common/dtos/spell-formatted.dto";
import { SpellContent } from "@/resources/spells/schemas/spell-content.schema";
import { UpdateMonsterDto } from "@/resources/monsters/dtos/update-monster.dto";

@Injectable()
export class MonstersService {
  constructor(
    @InjectModel(Monster.name) private monsterModel: Model<Monster>,
    @InjectModel(Spell.name) private spellModel: Model<Spell>,
  ) {}

  private readonly SERVICE_NAME = MonstersService.name;
  private readonly logger = new Logger(this.SERVICE_NAME);
  private readonly mapper = new MonstersMapper();

  /**
   * Validate that all spell IDs exist in the database
   * @param spellIds Array of spell ObjectIds to validate
   * @throws NotFoundException if any spell is not found
   * @throws BadRequestException if any spell ID is invalid
   */
  private async validateSpells(spellIds: Types.ObjectId[]): Promise<void> {
    if (!spellIds || spellIds.length === 0) {
      return;
    }

    try {
      const invalidIds = spellIds.filter((id) => !Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        const message = `Invalid spell IDs: ${invalidIds.join(", ")}`;
        this.logger.error(message);
        throw new BadRequestException(message);
      }

      // Find all spells in one query
      const existingSpells = await this.spellModel
        .find({
          _id: { $in: spellIds },
          deletedAt: null,
        })
        .select("_id")
        .exec();

      // Check if all spells were found
      if (existingSpells.length !== spellIds.length) {
        const foundIds = existingSpells.map((spell) => spell._id.toString());
        const missingIds = spellIds.filter((id) => !foundIds.includes(id.toString()));
        const message = `Spells not found: ${missingIds.join(", ")}`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      this.logger.log(`Successfully validated ${spellIds.length} spell(s)`);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = "Error while validating spells";
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Populate spells in monster translations with full spell data
   * @param monster Monster entity to populate spells for
   * @param targetLang The language used when creating the monster
   * @returns Monster with populated spells
   */
  private async populateSpells(monster: any, targetLang: string): Promise<any> {
    try {
      // Extract all spell IDs from the monster
      const spellIds = this.extractSpellIds(monster);

      if (spellIds.length === 0) {
        return monster;
      }

      // Fetch all spells in one query
      const spells = await this.spellModel
        .find({
          _id: { $in: spellIds },
          deletedAt: null,
        })
        .exec();

      // Create a map for quick spell lookup
      const spellsMap = new Map<string, Spell>();
      spells.forEach((spell) => {
        spellsMap.set(spell._id.toString(), spell);
      });

      // Populate spells in each translation
      for (const [lang, content] of monster.translations) {
        if (content.spellcasting && content.spellcasting.length > 0) {
          for (const spellcasting of content.spellcasting) {
            if (spellcasting.spells && spellcasting.spells.length > 0) {
              const populatedSpells: SpellFormattedDto[] = [];

              for (const spellId of spellcasting.spells) {
                const spell = spellsMap.get(spellId.toString());

                if (spell) {
                  // Try to get spell content in the target language first
                  let spellContent: SpellContent | undefined = spell.translations.get(targetLang);

                  // If not available in target language, use the first available language
                  if (!spellContent && spell.languages.length > 0) {
                    spellContent = spell.translations.get(spell.languages[0]);
                  }

                  if (spellContent) {
                    populatedSpells.push({
                      srd: spellContent.srd,
                      name: spellContent.name,
                      description: spellContent.description,
                      level: spellContent.level,
                      castingTime: spellContent.castingTime,
                      range: spellContent.range,
                      components: spellContent.components,
                      duration: spellContent.duration,
                      school: spellContent.school,
                      effectType: spellContent.effectType,
                      damage: spellContent.damage,
                      healing: spellContent.healing,
                    });
                  }
                }
              }

              // Replace spell IDs with populated spell data
              spellcasting.spells = populatedSpells;
            }
          }
        }
      }

      return monster;
    } catch (error) {
      this.logger.error(`Error populating spells: ${error}`);
      // Return monster without populated spells in case of error
      return monster;
    }
  }

  /**
   * Extract all spell IDs from monster spellcasting arrays
   * @param monster Monster entity to extract spell IDs from
   * @returns Array of unique spell ObjectIds
   */
  private extractSpellIds(monster: Monster): Types.ObjectId[] {
    const spellIds: Types.ObjectId[] = [];

    // Iterate through all translations
    for (const [, content] of monster.translations) {
      if (content.spellcasting && content.spellcasting.length > 0) {
        for (const spellcasting of content.spellcasting) {
          if (spellcasting.spells && spellcasting.spells.length > 0) {
            spellIds.push(...spellcasting.spells);
          }
        }
      }
    }

    // Remove duplicates by converting to Set and back to Array
    return [...new Set(spellIds.map((id) => id.toString()))].map((id) => new Types.ObjectId(id));
  }

  async findAll(paginationMonster: PaginationMonster) {
    try {
      const { page = 1, offset = 10, name = "", lang = "" } = paginationMonster;
      const skip = (page - 1) * offset;

      const filters: any = { deletedAt: null };
      let projection: any = {
        tag: 1,
        languages: 1,
        deletedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      };

      // Si on recherche par nom
      if (name.length > 0) {
        const decodedName = decodeURIComponent(name);

        // Si on recherche aussi par langue
        if (lang.length > 0) {
          // Vérifie le nom dans la langue voule
          filters[`translations.${lang}.name`] = { $regex: decodedName, $options: "i" };
          // Affiche seulement la langue voulue
          projection = {
            ...projection,
            [`translations.${lang}`]: 1,
          };
        } else {
          // On cherche dans tous les langues
          const languages = await this.monsterModel.distinct("languages");
          filters["$or"] = languages.map((language) => ({
            [`translations.${language}.name`]: { $regex: decodedName, $options: "i" },
          }));

          // On affiche toutes les langues
          projection = {
            ...projection,
            translations: 1,
          };
        }
      } else {
        // Si on cherche seulement par langue
        if (lang.length > 0) {
          projection = {
            ...projection,
            [`translations.${lang}`]: 1,
          };
        } else {
          projection = {
            ...projection,
            translations: 1,
          };
        }
      }

      // Tri par défaut (tag desc)
      const sort: { [key: string]: 1 | -1 } = { tag: -1 };
      if (paginationMonster.sort) {
        const field = paginationMonster.sort.replace("-", "");
        sort[field] = paginationMonster.sort.startsWith("-") ? -1 : 1;
      }

      const totalItems = await this.monsterModel.countDocuments(filters);

      const start = Date.now();
      let monsters: Monster[] = await this.monsterModel
        .find(filters)
        .select(projection)
        .skip(skip)
        .limit(offset)
        .sort(sort)
        .exec();
      const end = Date.now();

      // Si on cherche par nom dans toutes les langues
      if (name.length > 0 && lang.length == 0) {
        const decodedName: string = decodeURIComponent(name).toLowerCase();

        monsters = monsters.map((monster) => {
          const filteredTranslations: Map<string, MonsterContent> = new Map();

          // On parcours toutes les langues
          for (const language of monster.languages) {
            const translation: MonsterContent = monster.translations.get(language);

            // Si le nom renseigné dans cette langue match
            if (translation && translation.name && translation.name.toLowerCase().includes(decodedName.toLowerCase())) {
              filteredTranslations.set(language, translation);
            }
          }

          // On remplace par les traduction qui on un nom qui match avec la recherche
          monster.translations = filteredTranslations;

          this.logger.log(JSON.stringify(monsters));

          this.logger.log(`Filtered translations: ${JSON.stringify(filteredTranslations)}`);

          return monster;
        });
      }

      this.logger.log(`Monsters found in ${end - start}ms`);

      return {
        message: `Monsters found in ${end - start}ms`,
        data: this.mapper.calculAvailablesLanguagesList(monsters),
        pagination: {
          page,
          offset,
          totalItems,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = "An error occurred while creating monster";
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  async findOne(id: Types.ObjectId, lang: string): Promise<IResponse<Monster>> {
    try {
      const projection: any = {
        tag: 1,
        languages: 1,
        translations: 1,
        deletedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      };

      const start: number = Date.now();
      const monster: Monster = await this.monsterModel.findById(id).select(projection).exec();
      const end: number = Date.now();

      if (!monster) {
        const message = `Monster #${id} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      if (monster.deletedAt) {
        const message = `Monster #${id} has been deleted`;
        this.logger.error(message);
        throw new GoneException(message);
      }

      // Si la langue spécifiée est invalide, on recupère la première langue disponible

      if (!monster.languages.includes(lang)) {
        lang = monster.languages[0];
      }

      // On récupère la traduction dans la langue demandée
      const translation: MonsterContent = monster.translations.get(lang);

      monster.translations = new Map<string, MonsterContent>();
      monster.translations.set(lang, translation);

      const message: string = `Monster #${id} found in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: this.mapper.calculAvailablesLanguages(monster),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while fetching monster #${id}: ${error.message}`;
      this.logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  async create(createMonsterDto: CreateMonsterDto): Promise<IResponse<Monster>> {
    try {
      const monster: Monster = this.mapper.dtoToEntity(createMonsterDto);

      // Extract and validate all spell IDs
      const spellIds = this.extractSpellIds(monster);
      if (spellIds.length > 0) {
        this.logger.log(`Validating ${spellIds.length} spell(s) for monster`);
        await this.validateSpells(spellIds);
      }

      const start: number = Date.now();
      const createdMonster = new this.monsterModel(monster);
      let savedMonster = await createdMonster.save();
      const end: number = Date.now();

      // Populate spells with full data
      savedMonster = await this.populateSpells(savedMonster, createMonsterDto.lang);

      const message: string = `Monster #${savedMonster._id} created in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: this.mapper.calculAvailablesLanguages(savedMonster),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = "An error occurred while creating monster";
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  async delete(id: Types.ObjectId, monster: Monster): Promise<IResponse<Monster>> {
    try {
      const start: number = Date.now();
      const deleteDate: Date = new Date();
      await this.monsterModel.updateOne({ _id: id }, { deletedAt: deleteDate }).exec();
      monster.deletedAt = deleteDate;
      const end: number = Date.now();

      const message: string = `Monster #${id} deleted in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: this.mapper.calculAvailablesLanguages(monster),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while deleting monster #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  async update(id: Types.ObjectId, oldMonster: Monster, updateData: UpdateMonsterDto): Promise<IResponse<Monster>> {
    try {
      const start: number = Date.now();
      await this.spellModel.updateOne({ _id: id }, updateData).exec();
      oldMonster.tag = updateData.tag;
      const end: number = Date.now();

      const message: string = `Monster #${id} updated in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: oldMonster,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while updating monster #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Add a new translation to an existing monster
   * @param id Monster ID
   * @param lang ISO 2 letter language code
   * @param translationDto Translation data
   * @param isAdmin Whether the user is an admin (can set srd: true)
   * @returns IResponse<Monster> with the updated monster
   */
  async addTranslation(
    id: Types.ObjectId,
    lang: string,
    translationDto: CreateMonsterTranslationDto,
    isAdmin: boolean = false,
  ): Promise<IResponse<Monster>> {
    try {
      // Validate language format
      if (!/^[a-z]{2}$/.test(lang)) {
        const message = `Invalid language code: ${lang}. Must be a 2-letter ISO code in lowercase (e.g., fr, en, es)`;
        this.logger.error(message);
        throw new BadRequestException(message);
      }

      // Find the monster
      const monster: Monster = await this.monsterModel.findById(id).exec();

      if (!monster) {
        const message = `Monster #${id} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      // Check if monster is deleted
      if (monster.deletedAt) {
        const message = `Monster #${id} has been deleted`;
        this.logger.error(message);
        throw new GoneException(message);
      }

      // Check if translation already exists
      if (monster.translations.has(lang)) {
        const message = `Translation for language '${lang}' already exists for monster #${id}`;
        this.logger.error(message);
        throw new ConflictException(message);
      }

      // Check permissions: if monster is not homebrew (tag != 0) and user is not admin
      if (monster.tag !== 0 && !isAdmin) {
        const message = `Only administrators can add translations to non-homebrew monsters`;
        this.logger.error(message);
        throw new ForbiddenException(message);
      }

      // Get the original content (use first available language as reference)
      const originalLang = monster.languages[0];
      const originalContent = monster.translations.get(originalLang);

      if (!originalContent) {
        const message = `Monster #${id} has no original content to translate from`;
        this.logger.error(message);
        throw new BadRequestException(message);
      }

      // Convert DTO to entity, merging text translations with original numeric values
      const monsterContent: MonsterContent = this.mapper.dtoTranslationToEntity(translationDto, originalContent);

      // Extract and validate all spell IDs from the new translation
      const tempMonster = {
        translations: new Map<string, MonsterContent>([[lang, monsterContent]]),
      } as Monster;
      const spellIds = this.extractSpellIds(tempMonster);
      if (spellIds.length > 0) {
        this.logger.log(`Validating ${spellIds.length} spell(s) for translation`);
        await this.validateSpells(spellIds);
      }

      const start: number = Date.now();

      // Add translation to monster
      monster.translations.set(lang, monsterContent);

      // Add language to languages array if not present
      if (!monster.languages.includes(lang)) {
        monster.languages.push(lang);
      }

      // Update the monster in database
      await this.monsterModel
        .updateOne(
          { _id: id },
          {
            $set: {
              [`translations.${lang}`]: monsterContent,
              languages: monster.languages,
              updatedAt: new Date(),
            },
          },
        )
        .exec();

      const end: number = Date.now();

      // Populate spells for response
      const populatedMonster = await this.populateSpells(monster, lang);

      // Filter to only return the new translation
      const responseMonster = { ...populatedMonster };
      responseMonster.translations = new Map<string, MonsterContent>();
      responseMonster.translations.set(lang, monsterContent);

      const message: string = `Translation '${lang}' added to monster #${id} in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: this.mapper.calculAvailablesLanguages(responseMonster),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while adding translation to monster #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }
}
