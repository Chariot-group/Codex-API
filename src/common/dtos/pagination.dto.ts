import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class Pagination {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({
    description: "Number of items to return",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  offset?: number = 10;

  @ApiPropertyOptional({
    description: "Sort field (prefix with '-' for descending order)",
    example: "-createdAt",
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
