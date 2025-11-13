import { IsOptional, IsString } from "class-validator";

export class langParam {

    @IsOptional()
    @IsString()
    lang?: string
}