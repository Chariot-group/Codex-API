import { Controller, Get, Param, Query } from "@nestjs/common";
import { MonstersService } from "@/resources/monsters/monsters.service";
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from "@nestjs/swagger";
import { IPaginatedResponse, IResponse } from "@/common/dtos/reponse.dto";
import { Monster } from "@/resources/monsters/schemas/monster.schema";
import { MonsterContent } from "@/resources/monsters/schemas/monster-content.schema";
import { PaginationMonster } from "@/resources/monsters/dtos/find-all.dto";

@ApiExtraModels(Monster, MonsterContent, IResponse, IPaginatedResponse)
@Controller("monsters")
export class MonstersController {
  constructor(private readonly monstersService: MonstersService) {}

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
  findOne(@Param("id") id: string) {
    return this.monstersService.findOne(+id);
  }
}
