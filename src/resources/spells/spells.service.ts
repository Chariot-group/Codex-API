import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { IResponse, IPaginatedResponse } from "@/common/dtos/reponse.dto";
import { PaginationSpell } from "@/resources/spells/dtos/find-all.dto";
import { DtoMapper } from "@/common/mappers/common.mapper";

@Injectable()
export class SpellsService {
  constructor(@InjectModel(Spell.name) private spellModel: Model<Spell>) {}

  private readonly SERVICE_NAME = SpellsService.name;
  private readonly logger = new Logger(this.SERVICE_NAME);
  private readonly mapper = new DtoMapper<Spell>();

  async findAll(paginationSpell: PaginationSpell) : Promise<IPaginatedResponse<Spell[]>> {
    try {
      const { page = 1, offset = 10, name = "", lang = "" } = paginationSpell;
      const skip = (page - 1) * offset;

      const filters: any = {};
      let projection: any = {
        tag: 1,
        languages: 1,
        deletedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      };

      if (name.length > 0) {
        const decodedName = decodeURIComponent(name);
        if (lang.length > 0) {
          filters[`translations.${lang}.name`] = { $regex: decodedName, $options: "i" };
          projection = {
            ...projection,
            [`translations.${lang}`]: 1,
          };
        } else {
          // Filter by name on all available languages dynamically
          // First, get all distinct languages from the collection
          const languages = await this.spellModel.distinct("languages");
          // Build $or filter for all languages
          filters["$or"] = languages.map(language => ({
            [`translations.${language}.name`]: { $regex: decodedName, $options: "i" }
          }));

          // Projection: include only translations matching the filter
          // Since MongoDB projection can't filter array elements by condition easily,
          // we will project all translations but filter in-memory after querying
          projection = {
            ...projection,
            translations: 1,
          };
        }
      } else {
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

      // If no lang provided and name filter applied, filter translations to keep only those matching the name
      if (name.length > 0 && lang.length == 0) {
        const decodedName = decodeURIComponent(name).toLowerCase();
        spells = spells.map(spell => {
          const filteredTranslations: any = {};
          for (const language of spell.languages) {
            const translation = spell.translations.get(language);
            if (translation && translation.name && translation.name.toLowerCase().includes(decodedName)) {
              filteredTranslations[language] = translation;
            }
          }
          spell.translations = filteredTranslations;
          return spell;
        }) as Spell[];
      }

      this.logger.log(`Spells found in ${end - start}ms`);

      return {
        message: `Spells found in ${end - start}ms`,
        data: this.mapper.transforms(spells),
        pagination: {
          page,
          offset,
          totalItems,
        },
      };
    } catch (error) {
      const message: string = `Error while fetching spells: ${error.message}`;
      this.logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  async findOne(id: Types.ObjectId, lang: string) : Promise<IResponse<Spell>> {
    try {

      let projection: any = {
        tag: 1,
        languages: 1,
        [`translations.${lang}`]: 1,
        deletedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      };

      const start: number = Date.now();
      const spell: Spell = await this.spellModel.findById(id).select(projection).exec();
      const end: number = Date.now();

      if(!spell) {
        const message = `Spell #${id} not found`
        this.logger.error(message);
        throw new NotFoundException(message);
      }

      const message: string = `Spell #${id} found in ${end - start}ms`;
      this.logger.log(message);

      return {
        message,
        data: this.mapper.transform(spell),
      };

    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while fetching spell #${id}: ${error.message}`;
      this.logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }
}
