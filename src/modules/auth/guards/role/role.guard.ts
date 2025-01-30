import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Reflector} from "@nestjs/core";
import {ROLE_KEY} from "../../../../common/decorators/role.decorator";
import {Role} from "../../../../common/enums/Role.enum";
import {Request} from "express";
import {ForbiddenMessage} from "../../../../common/enums/messages.enum";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const request: Request = context.switchToHttp().getRequest<Request>();
    const user = request?.user;
    const userRole = user?.role ?? Role.User;
    if (userRole === Role.Admin) return true;
    if (requiredRoles.includes(userRole)) return true;
    throw new ForbiddenException(ForbiddenMessage.RoleAccess)
  }
}
