import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsNotEmpty, IsString} from "class-validator";
import {AuthMethod} from "../enums/method.enum";
import {AuthType} from "../enums/type.enum";

export class AuthDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    username: string;
    @ApiProperty({enum: AuthMethod})
    @IsNotEmpty()
    @IsEnum(AuthMethod)
    method: AuthMethod;
    @ApiProperty({enum: AuthType})
    @IsNotEmpty()
    @IsEnum(AuthType)
    type: AuthType;
}

export class OtpDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string
}