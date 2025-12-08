import { InvalidParamDto, ProblemDetailsDto } from "@/common/dtos/errors.dto";
import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("Codex API")
  .setDescription("Codex API Documentation")
  .setVersion(process.env.API_VERSION || "unknown")
  .addServer(`${process.env.API_URL_SWAGGER || "unknown"}`)
  .addBearerAuth()
  .build();

export function setupSwagger(app: INestApplication) {
  return SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [ProblemDetailsDto, InvalidParamDto],
  });
}
