import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";
import { instance } from "@/logger/winston.logger";
import { WinstonModule } from "nest-winston";
import { setupSwagger } from "@/config/swagger.config";
import { SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { ProblemDetailsFilter } from "@/common/filters/errors.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: instance,
    }),
  });

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalFilters(new ProblemDetailsFilter());

  const document = setupSwagger(app);
  SwaggerModule.setup("/", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      oauth2RedirectUrl: `${process.env.API_URL}/oauth2-redirect.html`,
      initOAuth: {
        clientId: process.env.SSO_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
        usePkceWithAuthorizationCodeGrant: true,
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.listen(process.env.API_PORT);
}
bootstrap();
