import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  ParseFilePipe,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ProfileDto } from "./dto/profile.dto";
import { ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumerEnum } from "../auth/enums/swagger.consumer.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import {
  MulterDestination,
  MulterFilename,
  MulterStorage,
} from "../../common/untils/multer.utils";
import { AuthGuard } from "../auth/guards/auth/auth.guard";
import { UploadedOptionalFiles } from "../../common/decorators/upload-file.decorator";

@Controller("user")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authentication")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @ApiConsumes(SwaggerConsumerEnum.MultipartData)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image", maxCount: 1 },

        { name: "bgImage", maxCount: 1 },
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

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
