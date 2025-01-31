import {IsBoolean, IsNotEmpty, IsUUID} from "class-validator";

export class SuspendedDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}