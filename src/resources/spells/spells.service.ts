import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Spell } from "./schemas/spell.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

@Injectable()
export class SpellsService {

  constructor(
    @InjectModel(Spell.name) private spellModel: Model<Spell>,
  ) { }

  async findAll(query: {
    page?: number;
    offset?: number;
    sort?: string;
    name?: string;
  }) {

    try {
      const { page = 1, offset = 10, name = '' } = query;
      const skip = (page - 1) * offset;

      const filters = {
        name: { $regex: `${decodeURIComponent(name)}`, $options: 'i' },
      };

      const sort: { [key: string]: 1 | -1 } = { updatedAt: -1 };

      if (query.sort) {
        query.sort.startsWith('-')
          ? (sort[query.sort.substring(1)] = -1)
          : (sort[query.sort] = 1);
      }

      const totalItems = await this.spellModel.countDocuments(filters);

      const start: number = Date.now();
      const spells = await this.spellModel
        .find(filters)
        .skip(skip)
        .limit(offset)
        .sort(sort)
        .exec();
      const end: number = Date.now();

      const message = `Spells found in ${end - start}ms`;
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
      const message = `Error while fetching spells: ${error.message}`;
      throw new InternalServerErrorException(message);
    }
  }

  async findOneById(id: Types.ObjectId) {
    try {
      const start: number = Date.now();
      const spell = await this.spellModel
        .findById(id)
        .exec();
      const end: number = Date.now();

      const message = `Spell #${id} found in ${end - start}ms`;
      return {
        message,
        data: spell,
      };
    } catch (error) {
      const message = `Error while fetching spell #${id}: ${error.message}`;
      throw new InternalServerErrorException(message);
    }
  }

  async findOneByLabel(label: string) {
    try {
      const start: number = Date.now();
      const spell = await this.spellModel
        .findOne({ name: label })
        .exec();
      const end: number = Date.now();

      const message = `Spell ${label} found in ${end - start}ms`;
      return {
        message,
        data: spell,
      };
    } catch (error) {
      const message = `Error while fetching spell ${label}: ${error.message}`;
      throw new InternalServerErrorException(message);
    }
  }
}
