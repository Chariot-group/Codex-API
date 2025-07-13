import { Controller, Get, Param, Query, BadRequestException, NotFoundException } from "@nestjs/common";
import { SpellsService } from "@/resources/spells/spells.service";
import { ParseNullableIntPipe } from "@/common/pipes/parse-nullable-int.pipe";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { ParseMongoIdPipe } from "@/common/pipes/parse-mong-id.pipe";

@Controller("spells")
export class SpellsController {
  constructor(
    private readonly spellsService: SpellsService,
  @InjectModel(Spell.name) private spellModel: Model<Spell>,
) {}

  private async validateResource(id: Types.ObjectId): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      const message = `Error while fetching spell #${id}: Id is not a valid mongoose id`;
      throw new BadRequestException(message);
    }
    const spell = await this.spellModel.findById(id).exec();

    if (!spell) {
      const message = `Spell #${id} not found`;
      throw new NotFoundException(message);
    }
  }

  private async validateResourceByName(name: string): Promise<void> {
    const spell = await this.spellModel.findOne({ name: { $regex: `${decodeURIComponent(name)}`, $options: 'i' } }).exec();

    if (!spell) {
      const message = `Spell ${name} not found`;
      throw new NotFoundException(message);
    }
  }

  @Get()
  findAll(
    @Query('page', ParseNullableIntPipe) page?: number,
    @Query('offset', ParseNullableIntPipe) offset?: number,
    @Query('sort') sort?: string,
    @Query('name') name?: string) {

    return this.spellsService.findAll({
      page,
      offset,
      sort,
      name
    });

  }

  @Get(':id')
  async findOneById(@Param('id', ParseMongoIdPipe) id: Types.ObjectId) {
    await this.validateResource(id);

    return this.spellsService.findOneById(id);
  }

  @Get('/name/:name')
  async findOneByName(@Param('name') name: string) {
    await this.validateResourceByName(name);
    
    return this.spellsService.findOneByName(name);
  }
}
