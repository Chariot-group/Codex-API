import { Module } from "@nestjs/common";
import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { SpellsModule } from '@/resources/spells/spells.module';
import { MonstersModule } from './resources/monsters/monsters.module';

@Module({
  imports: [SpellsModule, MonstersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
