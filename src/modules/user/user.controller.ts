import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe, ParseUUIDPipe,
  Patch,
  Post,
  Put, Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {UserService} from "./user.service";
import {CreateUserDto} from "./dto/create-user.dto";
import {
  ChangeEmailDto,
  ChangePhoneDto,
  ChangeUsernameDto,
  ProfileDto,
} from "./dto/profile.dto";
import {ApiConsumes, ApiParam} from "@nestjs/swagger";
import {SwaggerConsumerEnum} from "../auth/enums/swagger.consumer.enum";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import {MulterStorage} from "../../common/untils/multer.utils";
import {Response} from "express";
import {CookiesKey} from "../../common/enums/cookie.enum";
import {OtpDto} from "../auth/dto/auth.dto";
import {AuthMethod} from "../auth/enums/method.enum";
import {AuthDecorator} from "../../common/decorators/auth.decorator";
import {Pagination} from "../../common/decorators/pagination.decorator";
import {PaginationDto} from "../../common/dto/pagination.dto";
import {SuspendedDto} from "./dto/suspended.dto";
import {CanAccess} from "../../common/decorators/role.decorator";
import {Role} from "../../common/enums/Role.enum";

@Controller("user")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post("check-email-otp")
  checkEmailOtp(@Body() otpDto: OtpDto) {
    return this.userService.verifyCode(otpDto.code, AuthMethod.Email);
  }

  @Post("check-phone-otp")
  checkPhoneOtp(@Body() otpDto: OtpDto) {
    return this.userService.verifyCode(otpDto.code, AuthMethod.Phone);
  }

  @Get('/profile')
  profile() {
    return this.userService.profile();
  }

  @Get('follow/:followingId')
  @ApiParam({name: 'followingId'})
  follow(@Param('followingId', ParseUUIDPipe) followingId: string) {
    return this.userService.followToggle(followingId)
  }

  @Get('followers')
  @Pagination()
  followers(@Query() paginationDto: PaginationDto) {
    return this.userService.followers(paginationDto)
  }

  @Get('/following')
  @Pagination()
  following(@Query() paginationDto: PaginationDto) {
    return this.userService.following(paginationDto)
  }


  @Patch("/change-email")
  async changeEmail(
    @Body() changeEmailDto: ChangeEmailDto,
    @Res() response: Response,
  ) {
    const {code, token, message} = await this.userService.changeEmailOrPhone(
      changeEmailDto.email,
      AuthMethod.Email,
    );
    if (message) return response.json({message});
    response.cookie(CookiesKey.Email_OTP, token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 2),
    });
    response.json({
      otpSent: true,
      code,
      message: "OTP sent",
    });
  }

  @Patch("/change-phone")
  async changePhone(
    @Body() changePhoneDto: ChangePhoneDto,
    @Res() response: Response,
  ) {
    const {
      code: code,
      token,
      message,
    } = await this.userService.changeEmailOrPhone(
      changePhoneDto.phone,
      AuthMethod.Phone,
    );
    if (message) return response.json({message});
    response.cookie(CookiesKey.Phone_OTP, token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 2),
    });
    response.json({
      otpSent: true,
      code,
      message: "OTP sent",
    });
  }

  @ApiConsumes(SwaggerConsumerEnum.MultipartData)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {name: "image", maxCount: 1},

        {name: "bgImage", maxCount: 1},
      ],
      {
        storage: MulterStorage("profile"),
      },
    ),
  )
  @Put("/profile")
  changeProfile(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [],
      }),
    )
      files: any,
    @Body()
      profileDto: ProfileDto,
  ) {
    return this.userService.changeProfile(files, profileDto);
  }

  @Put('/suspend')
  @CanAccess(Role.Admin)
  toggleSuspend(@Body() suspendedDto: SuspendedDto) {
    return this.userService.toggleSuspended(suspendedDto)
  }

  @Patch("/change-username")
  changeUsername(@Body() changeUsernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(changeUsernameDto.username);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
