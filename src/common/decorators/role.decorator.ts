import {SetMetadata} from "@nestjs/common";
import {Role} from "../enums/Role.enum";

export const ROLE_KEY = "ROLES";
export const CanAccess = (...roles: Role[]) => SetMetadata(ROLE_KEY, roles)