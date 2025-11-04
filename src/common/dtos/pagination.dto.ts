import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class Pagination {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items to return",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  offset?: number = 10;

  @ApiPropertyOptional({
    description: "Sort field (prefix with '-' for descending order)",
    example: "-createdAt",
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
