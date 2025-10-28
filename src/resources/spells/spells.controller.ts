import { Controller, Get, Param, Query, BadRequestException, Logger } from "@nestjs/common";
import { SpellsService } from "@/resources/spells/spells.service";
import { Types } from "mongoose";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { ParseMongoIdPipe } from "@/common/pipes/parse-mong-id.pipe";
import { IResponse } from "@/common/dtos/reponse.dto";
import { PaginationSpell } from "@/resources/spells/dto/pagination-spell.dto";

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
    @Query() query: PaginationSpell,
  ) {
    return this.spellsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id", ParseMongoIdPipe) id: Types.ObjectId) {
    return this.validateResource(id);
  }
}
