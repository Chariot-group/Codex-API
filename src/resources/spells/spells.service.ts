import {
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

      // Si on cherche par nom dans toutes les langues
      if (name.length > 0 && lang.length == 0) {
        const decodedName: string = decodeURIComponent(name).toLowerCase();

        spells = spells.map((spell) => {
          let filteredTranslations: Map<string, SpellContent> = new Map();

          // On parcours toutes les langues
          for (const language of spell.languages) {
            const translation: SpellContent = spell.translations.get(language);

            // Si le nom renseigné dans cette langue match
            if (translation && translation.name && translation.name.toLowerCase().includes(decodedName.toLowerCase())) {
              filteredTranslations.set(language, translation);
            }
          }
          // On remplace par les traduction qui on un nom qui match avec la recherche
          spell.translations = filteredTranslations;

          this.logger.log(`Filtered translations: ${JSON.stringify(filteredTranslations)}`);
          return spell;
        }) as Spell[];
      }

      this.logger.log(JSON.stringify(spells));

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
}
