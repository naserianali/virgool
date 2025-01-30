import {applyDecorators, UseGuards} from "@nestjs/common";
import {ApiBearerAuth} from "@nestjs/swagger";
import {AuthGuard} from "../../modules/auth/guards/auth/auth.guard";
import {RoleGuard} from "../../modules/auth/guards/role/role.guard";

export function AuthDecorator() {
    return applyDecorators(
        ApiBearerAuth("Authentication"),
        UseGuards(AuthGuard , RoleGuard)
    )
}