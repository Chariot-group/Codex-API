import { Controller, Get, Param, Query, BadRequestException, Logger } from "@nestjs/common";
import { SpellsService } from "@/resources/spells/spells.service";
import { ParseNullableIntPipe } from "@/common/pipes/parse-nullable-int.pipe";
import { Types } from "mongoose";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { ParseMongoIdPipe } from "@/common/pipes/parse-mong-id.pipe";
import { IResponse } from "@/common/interfaces/reponse.interface";

@Controller("spells")
export class SpellsController {
  constructor(
    private readonly spellsService: SpellsService,
  ) {}

  private readonly CONTROLLER_NAME = SpellsController.name;
  private readonly logger = new Logger(this.CONTROLLER_NAME);

  /**
   * Verify that the resource exists
   * @param id Resource ID
   * @returns object IResponse<Spell>
   */
  private async validateResource(id: Types.ObjectId): Promise<IResponse<Spell>> {
    if (!Types.ObjectId.isValid(id)) {
      const message = `Error while fetching spell #${id}: Id is not a valid mongoose id`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    return await this.spellsService.findOne(id);
  }

  @Get()
  findAll(
    @Query("page", ParseNullableIntPipe) page?: number,
    @Query("offset", ParseNullableIntPipe) offset?: number,
    @Query("sort") sort?: string,
    @Query("name") name?: string,
  ) {
    return this.spellsService.findAll({
      page,
      offset,
      sort,
      name,
    });
  }

  @Get(":id")
  async findOne(@Param("id", ParseMongoIdPipe) id: Types.ObjectId) {
    return this.validateResource(id);
  }
}
