import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";
import { instance } from "@/logger/winston.logger";
import { WinstonModule } from "nest-winston";
import { setupSwagger } from "@/config/swagger.config";
import { SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: instance,
    }),
  });

  const document = setupSwagger(app);
  SwaggerModule.setup("swagger", app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.listen(process.env.API_PORT!);
}
bootstrap();
