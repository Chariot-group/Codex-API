import { HttpException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Monster } from "@/resources/monsters/schemas/monster.schema";
import { Model } from "mongoose";
import { PaginationMonster } from "@/resources/monsters/dtos/find-all.dto";
import { MonsterContent } from "@/resources/monsters/schemas/monster-content.schema";
import { MonstersMapper } from "@/resources/monsters/mappers/monsters.mapper";

@Injectable()
export class MonstersService {
  constructor(@InjectModel(Monster.name) private monsterModel: Model<Monster>) {}

  private readonly SERVICE_NAME = MonstersService.name;
  private readonly logger = new Logger(this.SERVICE_NAME);
  private readonly mapper = new MonstersMapper();

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
          let filteredTranslations: Map<string, MonsterContent> = new Map();

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
        }) as Monster[];
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
      const message: string = `Error while fetching monsters: ${error.message}`;
      this.logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} monster`;
  }
}
