import {
  Controller,
  Get,
  BadRequestException,
  Logger,
  Query,
  Param,
  Patch,
  Body,
  Post,
  Req,
  Delete,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiOkResponse, ApiExtraModels, getSchemaPath, ApiParam } from "@nestjs/swagger";
import { SpellsService } from "@/resources/spells/spells.service";
import { Types } from "mongoose";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import { ParseMongoIdPipe } from "@/common/pipes/parse-mong-id.pipe";
import { IPaginatedResponse, IResponse } from "@/common/dtos/reponse.dto";
import { PaginationSpell } from "@/resources/spells/dtos/find-all.dto";
import { langParam } from "@/resources/spells/dtos/find-one.dto";
import { SpellContent } from "@/resources/spells/schemas/spell-content.schema";
import { UpdateSpellDto } from "@/resources/spells/dtos/update-spell.dto";
import { CreateSpellDto } from "@/resources/spells/dtos/create-spell.dto";

@ApiExtraModels(Spell, SpellContent, IResponse, IPaginatedResponse)
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
  private async validateResource(id: Types.ObjectId, lang: string): Promise<IResponse<Spell>> {
    if (!Types.ObjectId.isValid(id)) {
      const message = `Error while fetching spell #${id}: Id is not a valid mongoose id`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    return await this.spellsService.findOne(id, lang);
  }

  @Get()
  @ApiOperation({ summary: "Get a collection of paginated spells" })
  @ApiOkResponse({
    description: "Spells found successfully",
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
    description: "The ID of the spell to update",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiParam({
    name: "lang",
    type: String,
    description: "The ISO 2 code of translation",
    example: "en",
  })
  @ApiOperation({ summary: "Get a spell by ID" })
  @ApiOkResponse({
    description: "Spell found successfully",
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
  @ApiResponse({ status: 410, description: "Spell #ID has been deleted" })
  async findOne(
    @Param("id", ParseMongoIdPipe) id: Types.ObjectId,
    @Query() query: langParam,
  ): Promise<IResponse<Spell>> {
    const { lang = "en" } = query;
    return this.validateResource(id, lang);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a spell by ID" })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "The ID of the spell to retrieve",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiOkResponse({
    description: "Spell updated successfully",
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
  @ApiResponse({
    status: 400,
    description: "Validation DTO failed",
    schema: {
      allOf: [
        {
          example: {
            message: ["tag must be a number conforming to the specified constraints"],
            statusCode: 400,
            error: "Bad Request",
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: "Spell #ID not found" })
  @ApiResponse({ status: 410, description: "Spell #ID has been deleted" })
  async update(
    @Param("id", ParseMongoIdPipe) id: Types.ObjectId,
    @Body() updateData: UpdateSpellDto,
  ): Promise<IResponse<Spell>> {
    const oldSpell: IResponse<Spell> = await this.validateResource(id, "en");
    return this.spellsService.update(id, oldSpell.data, updateData);
  }

  @Post()
  @ApiOperation({ summary: "Create a new spell" })
  @ApiOkResponse({
    description: "Spell created successfully",
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
  @ApiResponse({
    status: 400,
    description: "Validation DTO failed",
    schema: {
      allOf: [
        {
          example: {
            message: [
              "spellContent.description must be a string",
              "spellContent.level must be a number conforming to the specified constraints",
            ],
            statusCode: 400,
            error: "Bad Request",
          },
        },
      ],
    },
  })
  async create(@Body() spellDto: CreateSpellDto): Promise<IResponse<Spell>> {
    return this.spellsService.create(spellDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a spell by ID" })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "The ID of the spell to delete",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiOkResponse({
    description: "Spell #ID deleted",
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
  @ApiResponse({ status: 410, description: "Spell #ID has been deleted" })
  async delete(@Param("id", ParseMongoIdPipe) id: Types.ObjectId): Promise<IResponse<Spell>> {
    const spell: IResponse<Spell> = await this.validateResource(id, "en");

    return this.spellsService.delete(id, spell.data);
  }
}
