import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    title: string;
    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional()
    priority: number;
}
