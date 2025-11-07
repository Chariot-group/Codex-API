import { Pagination } from "@/common/dtos/pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class PaginationMonster extends Pagination {
  @ApiProperty({
    description: "Filter monsters by name",
    required: false,
    example: "Goblin",
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Filter by language code (ISO 2 code)",
    required: false,
    example: "en",
    type: String,
  })
  @IsOptional()
  @IsString()
  lang?: string;
}
