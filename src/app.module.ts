import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DysonModule } from "./script/dyson/dyson.module";

@Module({
  imports: [DysonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
