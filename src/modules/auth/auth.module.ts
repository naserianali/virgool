import {Module} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {AuthController} from "./auth.controller";
import {TokenService} from "./token.service";
import {JwtService} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../user/entities/user.entity";
import {ProfileEntity} from "../user/entities/profile.entity";
import {OtpEntity} from "../user/entities/otp.entity";
import {GoogleAuthController} from './google-auth/google-auth.controller';
import {PassportModule} from "@nestjs/passport";
import {GoogleStrategy} from "./strategy/google.strategy";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ProfileEntity, OtpEntity])],
  controllers: [AuthController, GoogleAuthController],
  providers: [AuthService, TokenService, JwtService, GoogleStrategy],
  exports: [AuthService, TokenService, JwtService, TypeOrmModule , GoogleStrategy],
})
export class AuthModule {
}
