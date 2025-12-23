import { InvalidParamDto, ProblemDetailsDto } from "@/common/dtos/errors.dto";
import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("Codex API")
  .setDescription("Codex API Documentation")
  .setVersion(process.env.API_VERSION || "unknown")
  .addServer(`${process.env.API_URL || "unknown"}`)
  .addOAuth2({
    type: "oauth2",
    flows: {
      authorizationCode: {
        authorizationUrl: `${process.env.SSO_URL}/realms/${process.env.SSO_REALM}/protocol/openid-connect/auth`,
        tokenUrl: `${process.env.SSO_URL}/realms/${process.env.SSO_REALM}/protocol/openid-connect/token`,
        scopes: {
          openid: "OpenID Connect",
        },
      },
    },
  })
  .build();

export function setupSwagger(app: INestApplication) {
  return SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [ProblemDetailsDto, InvalidParamDto],
  });
}
