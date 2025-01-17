import {IsArray, IsNotEmpty, IsOptional, IsString, Length} from "class-validator";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

export class CreateBlogDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(2, 150)
    title: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(2, 150)
    slug: string;
    @ApiPropertyOptional({format: "binary"})
    @IsOptional()
    image: string
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(2, 300)
    description: string
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(100)
    content: string
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    studyTime: string
    @ApiProperty({type: String, isArray: true})
    @IsNotEmpty()
    @IsArray()
    categories: string[]
}

export class BlogFilterDto {
    search: string
    category: string
}