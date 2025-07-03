import { Controller, Get, Param } from "@nestjs/common";
import { MonstersService } from "@/resources/monsters/monsters.service";

@Controller("monsters")
export class MonstersController {
  constructor(private readonly monstersService: MonstersService) {}
  @Get()
  findAll() {
    return this.monstersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.monstersService.findOne(+id);
  }
}
