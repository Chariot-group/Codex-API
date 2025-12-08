import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { MonstersService } from "@/resources/monsters/monsters.service";
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { IPaginatedResponse, IResponse } from "@/common/dtos/reponse.dto";
import { Monster } from "@/resources/monsters/schemas/monster.schema";
import { MonsterContent } from "@/resources/monsters/schemas/monster-content.schema";
import { PaginationMonster } from "@/resources/monsters/dtos/find-all.dto";
import { CreateMonsterDto } from "@/resources/monsters/dtos/create-monster.dto";
import { CreateMonsterTranslationDto } from "@/resources/monsters/dtos/create-monster-translation.dto";
import { ParseMongoIdPipe } from "@/common/pipes/parse-mong-id.pipe";
import { Types } from "mongoose";
import { langParam } from "@/resources/monsters/dtos/find-one.dto";
import { ProblemDetailsDto } from "@/common/dtos/errors.dto";
import { UpdateMonsterDto } from "@/resources/monsters/dtos/update-monster.dto";

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
  @ApiResponse({ status: 404, description: "Monster #ID not found", type: ProblemDetailsDto })
  @ApiResponse({
    status: 400,
    description: "Error while fetching monster #ID: Id is not a valid mongoose id",
    type: ProblemDetailsDto,
  })
  @ApiResponse({ status: 410, description: "Monster #ID has been deleted", type: ProblemDetailsDto })
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
    type: ProblemDetailsDto,
  })
  async create(@Body() CreateMonsterDto: CreateMonsterDto): Promise<IResponse<Monster>> {
    return this.monstersService.create(CreateMonsterDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a monster by ID" })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "The ID of the monster to delete",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiOkResponse({
    description: "Monster #ID deleted",
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
  @ApiResponse({ status: 404, description: "Monster #ID not found", type: ProblemDetailsDto })
  @ApiResponse({
    status: 400,
    description: "Error while fetching monster #ID: Id is not a valid mongoose id",
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: 403,
    description: "Cannot delete monster #ID: it has at least one SRD translation",
    type: ProblemDetailsDto,
  })
  @ApiResponse({ status: 410, description: "Monster #ID has been deleted", type: ProblemDetailsDto })
  async delete(@Param("id", ParseMongoIdPipe) id: Types.ObjectId): Promise<IResponse<Monster>> {
    const monster: IResponse<Monster> = await this.validateResource(id, "en");
    // Vérifier si au moins une traduction a srd: true
    const hasSrdTranslation = Array.from(monster.data.translations.values()).some(
      (translation) => translation.srd === true,
    );

    if (hasSrdTranslation) {
      const message = `Cannot delete monster #${id}: it has at least one SRD translation`;
      this.logger.error(message);
      throw new ForbiddenException(message);
    }

    return this.monstersService.delete(id, monster.data);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a monster by ID" })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "The ID of the monster to update",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiOkResponse({
    description: "Monster updated successfully",
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
    description: "Validation error",
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: 403,
    description: "Cannot update monster #ID: it has at least one SRD translation",
    type: ProblemDetailsDto,
  })
  @ApiResponse({ status: 404, description: "Spell #ID not found", type: ProblemDetailsDto })
  @ApiResponse({ status: 410, description: "Spell #ID has been deleted", type: ProblemDetailsDto })
  async update(
    @Param("id", ParseMongoIdPipe) id: Types.ObjectId,
    @Body() updateData: UpdateMonsterDto,
  ): Promise<IResponse<Monster>> {
    const oldMonster: IResponse<Monster> = await this.validateResource(id, "en");

    const hasSrdTranslation = Array.from(oldMonster.data.translations.values()).some(
      (translation) => translation.srd === true,
    );

    if (hasSrdTranslation) {
      const message = `Cannot update monster #${id}: it has at least one SRD translation`;
      this.logger.error(message);
      throw new ForbiddenException(message);
    }

    return this.monstersService.update(id, oldMonster.data, updateData);
  }

  @Post(":id/translations/:lang")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add a new translation to a monster" })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "The ID of the monster to add a translation to",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiParam({
    name: "lang",
    type: String,
    required: true,
    description: "The ISO 2 letter code of the language (e.g., fr, es, de)",
    example: "fr",
  })
  @ApiResponse({
    status: 201,
    description: "Translation added successfully",
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
    description: "Validation error or invalid language code",
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - User doesn't have permission to add this translation",
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: 404,
    description: "Monster not found",
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: 409,
    description: "Translation for this language already exists",
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: 410,
    description: "Monster has been deleted",
    type: ProblemDetailsDto,
  })
  async addTranslation(
    @Param("id", ParseMongoIdPipe) id: Types.ObjectId,
    @Param("lang") lang: string,
    @Body() translationDto: CreateMonsterTranslationDto,
  ): Promise<IResponse<Monster>> {
    // TODO: Implement proper authentication/authorization with Guards
    // For now, we'll determine admin status based on some logic
    // In a real implementation, this would come from the JWT token or session
    const isAdmin = false; // Placeholder - should be extracted from request context

    return this.monstersService.addTranslation(id, lang.toLowerCase(), translationDto, isAdmin);
  }
}
