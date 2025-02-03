import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Gender} from "../enum/gender.enum";
import {IsEmail, IsEnum, IsMobilePhone, IsNotEmpty, IsOptional, IsString, Length} from "class-validator";

export class ProfileDto {
  @ApiPropertyOptional({nullable: true, type: "string"})
  @Length(3, 200)
  @IsOptional()
  nickname: string;
  @ApiPropertyOptional({nullable: true, type: "string"})
  @Length(3, 200)
  @IsOptional()
  bio: string;
  @ApiPropertyOptional({nullable: true, format: "binary"})
  @IsOptional()
  image: string;
  @ApiPropertyOptional({nullable: true, format: "binary"})
  @IsOptional()
  bgImage: string;
  @ApiPropertyOptional({nullable: true, enum: Gender})
  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;
  @ApiPropertyOptional({nullable: true, example: "1999-01-01T18:59:10.440Z"})
  @IsOptional()
  birthday: Date;
  @ApiPropertyOptional({nullable: true, type: "string"})
  @IsOptional()
  linkedInProfile: string;
}

export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ChangePhoneDto {
  @ApiProperty()
  @IsMobilePhone("fa-IR")
  phone: string;
}

export class ChangeUsernameDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;
}
