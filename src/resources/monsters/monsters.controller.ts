import { MonstersService } from "@/resources/monsters/monsters.service";
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { BadRequestException, Controller, Get, Logger, Param, Query, Body, Post } from "@nestjs/common";
import { IPaginatedResponse, IResponse } from "@/common/dtos/reponse.dto";
import { Monster } from "@/resources/monsters/schemas/monster.schema";
import { MonsterContent } from "@/resources/monsters/schemas/monster-content.schema";
import { PaginationMonster } from "@/resources/monsters/dtos/find-all.dto";
import { CreateMonsterDto } from "@/resources/monsters/dtos/create-monster.dto";
import { ParseMongoIdPipe } from "@/common/pipes/parse-mong-id.pipe";
import { Types } from "mongoose";
import { langParam } from "@/resources/monsters/dtos/find-one.dto";

@ApiExtraModels(Monster, MonsterContent, IResponse, IPaginatedResponse)
@Controller("monsters")
export class MonstersController {
  constructor(private readonly monstersService: MonstersService) {}

  private readonly CONTROLLER_NAME = MonstersController.name;
  private readonly logger = new Logger(this.CONTROLLER_NAME);

  /**
   * Verify that the resource exists
   * @param id Resource ID
   * @returns object IResponse<Monster>
   */
  private async validateResource(id: Types.ObjectId, lang: string): Promise<IResponse<Monster>> {
    if (!Types.ObjectId.isValid(id)) {
      const message = `Error while fetching monster #${id}: Id is not a valid mongoose id`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    return await this.monstersService.findOne(id, lang);
  }

  @Get()
  @ApiOperation({ summary: "Get a collection of paginated monsters" })
  @ApiOkResponse({
    description: "Monsters found successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(IPaginatedResponse) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(Monster) },
            },
          },
        },
      ],
    },
  })
  findAll(@Query() query: PaginationMonster): Promise<IPaginatedResponse<Monster[]>> {
    return this.monstersService.findAll(query);
  }
  @Get(":id")
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "The ID of the monster to update",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiParam({
    name: "lang",
    type: String,
    description: "The ISO 2 code of translation",
    example: "en",
  })
  @ApiOperation({ summary: "Get a monster by ID" })
  @ApiOkResponse({
    description: "Monster found successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(IResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(Monster) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: "Monster #ID not found" })
  @ApiResponse({ status: 400, description: "Error while fetching monster #ID: Id is not a valid mongoose id" })
  @ApiResponse({ status: 410, description: "Monster #ID has been deleted" })
  async findOne(
    @Param("id", ParseMongoIdPipe) id: Types.ObjectId,
    @Query() query: langParam,
  ): Promise<IResponse<Monster>> {
    const { lang = "en" } = query;
    return this.validateResource(id, lang);
  }

  @Post()
  @ApiOperation({ summary: "Create a new monster" })
  @ApiOkResponse({
    description: "Monster created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(IResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(Monster) },
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
            message: ["monsterContent.name must be a string"],
            statusCode: 400,
            error: "Bad Request",
          },
        },
      ],
    },
  })
  async create(@Body() monsterDto: CreateMonsterDto): Promise<IResponse<Monster>> {
    return this.monstersService.create(monsterDto);
  }
}
