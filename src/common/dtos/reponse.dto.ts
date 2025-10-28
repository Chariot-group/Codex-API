import { ApiProperty } from "@nestjs/swagger";

export class IResponse<T> {
  @ApiProperty({ example: "Spell #507f1f77bcf86cd799439011 found in 5ms" })
  message: string;

  @ApiProperty()
  data: T;
}
export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  offset: number;

  @ApiProperty({ example: 100 })
  totalItems: number;
}

export class IPaginatedResponse<T> extends IResponse<T> {
  @ApiProperty()
  pagination: PaginationMeta;
}
