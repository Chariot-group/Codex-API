import {
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
import { SpellsMapper } from "@/resources/spells/mappers/spells.mapper";
import { DeleteTranslationResponseDto } from "@/resources/spells/dtos/delete-translation.dto";

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

  async findOneWithAllTranslations(id: Types.ObjectId): Promise<Spell> {
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
      const spell: Spell = await this.spellModel.findById(id).select(projection).exec();
      const end: number = Date.now();

      if (!spell) {
        const message = `Spell #${id} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      this.logger.log(`Spell #${id} found with all translations in ${end - start}ms`);

      return spell;
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

  async deleteTranslation(id: Types.ObjectId, lang: string, spell: Spell): Promise<DeleteTranslationResponseDto> {
    try {
      // Vérifier que la traduction existe
      const translation: SpellContent = spell.translations.get(lang);
      if (!translation) {
        const message = `Translation '${lang}' not found for spell #${id}`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      // Vérifier que la traduction n'est pas déjà supprimée
      if (translation.deletedAt) {
        const message = `Translation '${lang}' for spell #${id} has already been deleted`;
        this.logger.error(message);
        throw new GoneException(message);
      }

      // Vérifier que la traduction n'est pas SRD (INTERDICTION ABSOLUE)
      if (translation.srd === true) {
        const message = `Cannot delete SRD translation '${lang}' for spell #${id}: SRD translations are protected and cannot be deleted`;
        this.logger.error(message);
        throw new ForbiddenException(message);
      }

      // Compter les traductions actives (non supprimées)
      const activeTranslations = Array.from(spell.translations.entries()).filter(([, content]) => !content.deletedAt);

      // Empêcher la suppression si c'est la dernière traduction active
      if (activeTranslations.length <= 1) {
        const message = `Cannot delete translation '${lang}' for spell #${id}: it is the last active translation`;
        this.logger.error(message);
        throw new ForbiddenException(message);
      }

      const start: number = Date.now();
      const deleteDate: Date = new Date();

      // Mettre à jour le deletedAt de la traduction et retirer la langue du tableau languages
      const updatedLanguages = spell.languages.filter((l) => l !== lang);

      await this.spellModel
        .updateOne(
          { _id: id },
          {
            $set: {
              [`translations.${lang}.deletedAt`]: deleteDate,
              languages: updatedLanguages,
            },
          },
        )
        .exec();

      const end: number = Date.now();

      const message: string = `Translation '${lang}' for spell #${id} deleted in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        deletedLanguage: lang,
        remainingLanguages: updatedLanguages,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while deleting translation '${lang}' for spell #${id}`;
      this.logger.error(`${message}: ${error}`);
      throw new InternalServerErrorException(message);
    }
  }
}
