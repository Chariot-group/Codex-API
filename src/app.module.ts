import { Module } from "@nestjs/common";
import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { SpellsModule } from '@/resources/spells/spells.module';
import { MonstersModule } from '@/resources/monsters/monsters.module';
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from '@nestjs/config';
import { DysonModule } from "@/script/dyson/dyson.module";
import { ConverterModule } from "@/script/converter/converter.module";

@Module({
  imports: [
    SpellsModule, 
    MonstersModule,
    DysonModule,
    ConverterModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL!)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
