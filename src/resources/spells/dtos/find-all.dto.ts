import { Pagination } from "@/common/dtos/pagination.dto";
import { IsOptional, IsString } from "class-validator";

export class PaginationSpell extends Pagination {

    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    lang?: string
}