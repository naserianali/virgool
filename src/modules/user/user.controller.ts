import {Controller, Get, Post, Body, Patch, Param, Delete, Put} from '@nestjs/common';
import {UserService} from './user.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {ProfileDto} from "./dto/profile.dto";
import {ApiConsumes} from "@nestjs/swagger";
import {SwaggerConsumerEnum} from "../auth/enums/swagger.consumer.enum";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @ApiConsumes(SwaggerConsumerEnum.MultipartData)
    @Put('/profile')
    changeProfile(@Body() profileDto: ProfileDto) {
        return this.userService.changeProfile(profileDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
