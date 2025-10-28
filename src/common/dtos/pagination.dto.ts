import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class Pagination {
    @IsOptional()
    @IsNumber()
    @Min(0)
    page?: number

    @IsOptional()
    @IsNumber()
    @Min(0)
    offset?: number

    @IsOptional()
    @IsString()
    sort?: string
}