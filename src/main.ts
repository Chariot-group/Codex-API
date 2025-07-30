import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";
import { instance } from '@/logger/winston.logger';
import { WinstonModule } from "nest-winston";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: instance,
    }),
  });
  
  await app.listen(process.env.API_PORT!);
}
bootstrap();
