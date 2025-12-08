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
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { IResponse, IPaginatedResponse } from "@/common/dtos/reponse.dto";
import { PaginationSpell } from "@/resources/spells/dtos/find-all.dto";
import { SpellContent } from "@/resources/spells/schemas/spell-content.schema";
import { UpdateSpellDto } from "@/resources/spells/dtos/update-spell.dto";
import { CreateSpellDto } from "@/resources/spells/dtos/create-spell.dto";
import { CreateSpellTranslationDto } from "@/resources/spells/dtos/create-spell-translation.dto";
import { SpellsMapper } from "@/resources/spells/mappers/spells.mapper";
import {
  SpellTranslationSummaryDto,
  SpellTranslationsListDto,
} from "@/resources/spells/dtos/spell-translation-summary.dto";

@Injectable()
export class SpellsService {
  constructor(@InjectModel(Spell.name) private spellModel: Model<Spell>) {}

  private readonly SERVICE_NAME = SpellsService.name;
  private readonly logger = new Logger(this.SERVICE_NAME);
  private readonly mapper = new SpellsMapper();

  async findAll(paginationSpell: PaginationSpell): Promise<IPaginatedResponse<Spell[]>> {
    try {
      const { page = 1, offset = 10, name = "", lang = "" } = paginationSpell;
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
          const languages = await this.spellModel.distinct("languages");
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
      if (paginationSpell.sort) {
        const field = paginationSpell.sort.replace("-", "");
        sort[field] = paginationSpell.sort.startsWith("-") ? -1 : 1;
      }

      const totalItems = await this.spellModel.countDocuments(filters);

      const start = Date.now();
      let spells: Spell[] = await this.spellModel
        .find(filters)
        .select(projection)
        .skip(skip)
        .limit(offset)
        .sort(sort)
        .exec();
      const end = Date.now();

      this.logger.log(`Spells found in ${end - start}ms`);

      return {
        message: `Spells found in ${end - start}ms`,
        data: this.mapper.calculAvailablesLanguagesList(spells),
        pagination: {
          page,
          offset,
          totalItems,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while fetching spells`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  async findOne(id: Types.ObjectId, lang: string): Promise<IResponse<Spell>> {
    try {
      let projection: any = {
        tag: 1,
        languages: 1,
        translations: 1,
        deletedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      };

      const start: number = Date.now();
      const spell: Spell = await this.spellModel.findById(id).select(projection).exec();
      const end: number = Date.now();

      if (!spell) {
        const message = `Spell #${id} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      if (spell.deletedAt) {
        const message = `Spell #${id} has been deleted`;
        this.logger.error(message);
        throw new GoneException(message);
      }

      // Si la langue spécifiée est invalide, on recupère la première langue disponible

      if (!spell.languages.includes(lang)) {
        lang = spell.languages[0];
      }

      // On récupère la traduction dans la langue demandée
      const translation: SpellContent = spell.translations.get(lang);

      spell.translations = new Map<string, SpellContent>();
      spell.translations.set(lang, translation);

      const message: string = `Spell #${id} found in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: this.mapper.calculAvailablesLanguages(spell),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while fetching spell #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  async update(id: Types.ObjectId, oldSpell: Spell, updateData: UpdateSpellDto): Promise<IResponse<Spell>> {
    try {
      const start: number = Date.now();
      await this.spellModel.updateOne({ _id: id }, updateData).exec();
      oldSpell.tag = updateData.tag;
      const end: number = Date.now();

      const message: string = `Spell #${id} updated in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: oldSpell,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while updating spell #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  async create(createSpellDto: CreateSpellDto): Promise<IResponse<Spell>> {
    try {
      const spell: Spell = this.mapper.dtoToEntity(createSpellDto);

      const start: number = Date.now();
      const createdSpell = new this.spellModel(spell);
      const savedSpell = await createdSpell.save();
      const end: number = Date.now();

      const message: string = `Spell #${savedSpell._id} created in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: this.mapper.calculAvailablesLanguages(savedSpell),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = "An error occurred while creating spell";
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  async delete(id: Types.ObjectId, spell: Spell): Promise<IResponse<Spell>> {
    try {
      const start: number = Date.now();
      const deleteDate: Date = new Date();
      await this.spellModel.updateOne({ _id: id }, { deletedAt: deleteDate }).exec();
      spell.deletedAt = deleteDate;
      const end: number = Date.now();

      const message: string = `Spell #${id} deleted in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: this.mapper.calculAvailablesLanguages(spell),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while deleting spell #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Get all available translations for a spell
   * @param id Spell ID
   * @returns List of translations with basic metadata
   */
  async getTranslations(id: Types.ObjectId): Promise<IResponse<SpellTranslationsListDto>> {
    try {
      const start: number = Date.now();
      const spell: Spell = await this.spellModel.findById(id).exec();
      const end: number = Date.now();

      if (!spell) {
        const message = `Spell #${id} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      if (spell.deletedAt) {
        const message = `Spell #${id} has been deleted`;
        this.logger.error(message);
        throw new GoneException(message);
      }

      const translations: SpellTranslationSummaryDto[] = [];

      for (const [lang, content] of spell.translations) {
        // Skip translations that have been deleted
        if (content.deletedAt) {
          continue;
        }

        translations.push({
          lang,
          srd: content.srd,
          name: content.name,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
        });
      }

      const message: string = `Spell #${id} translations found in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: {
          spellId: id.toString(),
          tag: spell.tag,
          translations,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while fetching translations for spell #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Get a specific translation for a spell
   * @param id Spell ID
   * @param lang ISO 2 letters language code
   * @returns The translation content in the specified language
   */
  async getTranslation(id: Types.ObjectId, lang: string): Promise<IResponse<SpellContent>> {
    try {
      const start: number = Date.now();
      const spell: Spell = await this.spellModel.findById(id).exec();
      const end: number = Date.now();

      if (!spell) {
        const message = `Spell #${id} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      if (spell.deletedAt) {
        const message = `Spell #${id} has been deleted`;
        this.logger.error(message);
        throw new GoneException(message);
      }

      const translation: SpellContent = spell.translations.get(lang);

      if (!translation) {
        const message = `Translation '${lang}' not found for spell #${id}`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      if (translation.deletedAt) {
        const message = `Translation '${lang}' for spell #${id} has been deleted`;
        this.logger.error(message);
        throw new GoneException(message);
      }

      const message: string = `Spell #${id} translation '${lang}' found in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: translation,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while fetching translation '${lang}' for spell #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }

  async addTranslation(
    id: Types.ObjectId,
    lang: string,
    translationDto: CreateSpellTranslationDto,
    isAdmin: boolean = false,
  ): Promise<IResponse<Spell>> {
    try {
      // Validate language format
      if (!/^[a-z]{2}$/.test(lang)) {
        const message = `Language code '${lang}' must be a 2-letter ISO code in lowercase (e.g., fr, en, es)`;
        this.logger.error(message);
        throw new ForbiddenException(message);
      }

      const spell: Spell = await this.spellModel.findById(id).exec();

      if (!spell) {
        const message = `Spell #${id} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      if (spell.deletedAt) {
        const message = `Spell #${id} has been deleted`;
        this.logger.error(message);
        throw new GoneException(message);
      }

      if (spell.languages.includes(lang)) {
        const message = `Translation for language '${lang}' already exists for spell #${id}`;
        this.logger.error(message);
        throw new ConflictException(message);
      }

      // Validate components count consistency with existing translations
      const existingTranslation = spell.translations.values().next().value as SpellContent;
      if (existingTranslation && existingTranslation.components) {
        const existingCount = existingTranslation.components.length;
        const newCount = translationDto.components.length;
        if (existingCount !== newCount) {
          const message = `Components count mismatch: new translation has ${newCount} component(s) but existing translations have ${existingCount} component(s)`;
          this.logger.error(message);
          throw new BadRequestException(message);
        }
      }

      // Check permissions for homebrew spells (tag=0)
      const requestedSrd = translationDto.srd ?? false;

      if (spell.tag === 0) {
        // For homebrew, user must be creator (not implemented yet) or admin
        // For now, allow but enforce srd: false for non-admins
        if (!isAdmin && requestedSrd) {
          const message = `Only administrators can create SRD translations for spell #${id}`;
          this.logger.error(message);
          throw new ForbiddenException(message);
        }
      } else {
        // For official spells (tag=1), only admins can add translations
        if (!isAdmin) {
          const message = `Only administrators can add translations to official spells (spell #${id})`;
          this.logger.error(message);
          throw new ForbiddenException(message);
        }
      }

      // Create the translation content
      const translationContent: SpellContent = new SpellContent();
      translationContent.srd = requestedSrd;
      translationContent.name = translationDto.name;
      translationContent.description = translationDto.description;
      translationContent.level = translationDto.level;
      translationContent.school = translationDto.school;
      translationContent.castingTime = translationDto.castingTime;
      translationContent.range = translationDto.range;
      translationContent.components = translationDto.components;
      translationContent.duration = translationDto.duration;
      translationContent.effectType = translationDto.effectType;
      translationContent.damage = translationDto.damage;
      translationContent.healing = translationDto.healing;
      translationContent.createdAt = new Date();
      translationContent.updatedAt = new Date();
      translationContent.deletedAt = null;

      const start: number = Date.now();

      // Add the translation to the translations map
      const updateQuery: any = {
        $set: {
          [`translations.${lang}`]: translationContent,
        },
        $addToSet: {
          languages: lang,
        },
        updatedAt: new Date(),
      };

      // If adding an SRD translation to a homebrew spell, update tag to 1
      if (requestedSrd && spell.tag === 0) {
        updateQuery.$set.tag = 1;
      }

      await this.spellModel.updateOne({ _id: id }, updateQuery).exec();

      const end: number = Date.now();

      // Fetch updated spell
      const updatedSpell: Spell = await this.spellModel.findById(id).exec();

      const message: string = `Translation '${lang}' added to spell #${id} in ${end - start}ms`;
      this.logger.log(message);

      // Filter to show only the newly added translation
      const filteredSpell = this.mapper.calculAvailablesLanguages(updatedSpell);
      const newTranslation = filteredSpell.translations.get(lang);
      filteredSpell.translations = new Map<string, SpellContent>();
      filteredSpell.translations.set(lang, newTranslation);

      return {
        message,
        data: filteredSpell,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while adding translation to spell #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }
}
