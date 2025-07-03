import { Module } from "@nestjs/common";
import { MonstersService } from "@/resources/monsters//monsters.service";
import { MonstersController } from "@/resources/monsters//monsters.controller";

@Module({
  controllers: [MonstersController],
  providers: [MonstersService],
})
export class MonstersModule {}
