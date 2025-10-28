import { Controller, Get, BadRequestException, Logger, Query, Param } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiOkResponse, ApiExtraModels, getSchemaPath, ApiParam } from "@nestjs/swagger";
import { SpellsService } from "@/resources/spells/spells.service";
import { Types } from "mongoose";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { ParseMongoIdPipe } from "@/common/pipes/parse-mong-id.pipe";
import { IPaginatedResponse, IResponse } from "@/common/dtos/reponse.dto";
import { PaginationSpell } from "@/resources/spells/dto/pagination-spell.dto";

@ApiExtraModels(Spell, IResponse, IPaginatedResponse)
@Controller("spells")
export class SpellsController {
  constructor(private readonly spellsService: SpellsService) {}

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
  @ApiOperation({ summary: "Get a collection of paginated spells" })
  @ApiOkResponse({
    description: "Spells found",
    schema: {
      allOf: [
        { $ref: getSchemaPath(IPaginatedResponse) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(Spell) },
            },
          },
        },
      ],
    },
  })
  findAll(@Query() query: PaginationSpell): Promise<IPaginatedResponse<Spell[]>> {
    return this.spellsService.findAll(query);
  }

  @Get(":id")
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "The ID of the spell to retrieve",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiOperation({ summary: "Get a spell by ID" })
  @ApiOkResponse({
    description: "Spell #ID found",
    schema: {
      allOf: [
        { $ref: getSchemaPath(IResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(Spell) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: "Spell #ID not found" })
  @ApiResponse({ status: 400, description: "Error while fetching spell #ID: Id is not a valid mongoose id" })
  async findOne(@Param("id", ParseMongoIdPipe) id: Types.ObjectId): Promise<IResponse<Spell>> {
    return this.validateResource(id);
  }
}
