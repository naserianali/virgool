import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateImageDto {
    @ApiProperty({format: "binary"})
    @IsNotEmpty()
    image: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    alt: string
    @ApiProperty()
    @IsString()
    @IsOptional()
    name: string
}
