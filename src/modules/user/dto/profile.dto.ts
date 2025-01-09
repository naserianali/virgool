import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsMobilePhone, IsNotEmpty, IsString, Length } from 'class-validator';
import { Gender } from "../enum/gender.enum";

export class ProfileDto {
  @ApiPropertyOptional({ nullable: true, type: "string" })
  @Length(3, 200)
  nickname: string;
  @ApiPropertyOptional({ nullable: true, type: "string" })
  @Length(3, 200)
  bio: string;
  @ApiPropertyOptional({ nullable: true, format: "binary" })
  image: string;
  @ApiPropertyOptional({ nullable: true, format: "binary" })
  bgImage: string;
  @ApiPropertyOptional({ nullable: true, enum: Gender })
  @IsEnum(Gender)
  gender: Gender;
  @ApiPropertyOptional({ nullable: true, example: "1999-01-01T18:59:10.440Z" })
  birthday: Date;
  @ApiPropertyOptional({ nullable: true, type: "string" })
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
