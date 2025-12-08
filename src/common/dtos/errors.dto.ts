import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";

export class InvalidParamDto {
  @ApiProperty({ example: "spellContent.level" })
  name: string;

  @ApiProperty({ example: "must be a number conforming to the specified constraints" })
  reason: string;
}

export class ProblemDetailsDto {
  @ApiProperty({ example: "https://httpstatuses.io/400" })
  type: string;

  @ApiProperty({ example: "Bad request" })
  title: string;

  @ApiProperty({ example: 400 })
  status: number;

  @ApiProperty({ example: "/spells" })
  instance: string;

  @ApiProperty({ example: "Validation failed" })
  detail?: string;

  @ApiProperty({ type: [InvalidParamDto], required: false })
  "invalid-params"?: InvalidParamDto[];
}
