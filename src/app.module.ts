import { Module } from "@nestjs/common";
import { SpellsModule } from "@/resources/spells/spells.module";
import { MonstersModule } from "@/resources/monsters/monsters.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { DysonModule } from "@/script/dyson/dyson.module";
import { ConverterModule } from "@/script/converter/converter.module";
import { AuthModule } from "@/auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "@/auth/auth.guard";

@Module({
  imports: [
    SpellsModule,
    MonstersModule,
    DysonModule,
    ConverterModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
