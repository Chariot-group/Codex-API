import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { IResponse, IPaginatedResponse } from "@/common/dtos/reponse.dto";
import { PaginationSpell } from "@/resources/spells/dto/pagination-spell.dto";

@Injectable()
export class SpellsService {
  constructor(@InjectModel(Spell.name) private spellModel: Model<Spell>) {}

  private readonly SERVICE_NAME = SpellsService.name;
  private readonly logger = new Logger(this.SERVICE_NAME);

  async findAll(paginationSpell: PaginationSpell) : Promise<IPaginatedResponse<Spell[]>> {
    try {
      const { page = 1, offset = 10, name = "" } = paginationSpell;
      const skip: number = (page - 1) * offset;

      const filters = {
        name: { $regex: `${decodeURIComponent(name)}`, $options: "i" },
      };

      const sort: { [key: string]: 1 | -1 } = { updatedAt: -1 };

      if (paginationSpell.sort) {
        paginationSpell.sort.startsWith("-") ? (sort[paginationSpell.sort.substring(1)] = -1) : (sort[paginationSpell.sort] = 1);
      }

      const totalItems: number = await this.spellModel.countDocuments(filters);

      const start: number = Date.now();
      const spells: Spell[] = await this.spellModel.find(filters).skip(skip).limit(offset).sort(sort).exec();
      const end: number = Date.now();

      const message: string = `Spells found in ${end - start}ms`;
      this.logger.log(message);
      return {
        message,
        data: spells,
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

  async findOne(id: Types.ObjectId) : Promise<IResponse<Spell>> {
    try {
      const start: number = Date.now();
      const spell: Spell = await this.spellModel.findById(id).exec();
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
        data: spell,
      };

    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message: string = `Error while fetching spell #${id}: ${error.message}`;
      this.logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }
}
