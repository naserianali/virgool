import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import {Request} from "express";
import {isJWT} from "class-validator";
import {AuthService} from "../../auth.service";
import {Reflector} from "@nestjs/core";
import {SKIP_AUTH} from "../../../../common/decorators/skip-auth.decorator";
import {AuthMessage, ForbiddenMessage} from "../../../../common/enums/messages.enum";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private reflector: Reflector,
    ) {
    }

    async canActivate(context: ExecutionContext) {
        const isAuthorizationSkipped = this.reflector.get<boolean>(SKIP_AUTH, context.getHandler());
        if (isAuthorizationSkipped) return true;
        const httpContext = context.switchToHttp();
        const request: Request = httpContext.getRequest<Request>();
        const token = this.extractToken(request);
        request.user = await this.authService.validateToken(token);
        if (request.user.suspended) throw new UnauthorizedException(AuthMessage.Blocked);
        return true;
    }

    protected extractToken(request: Request) {
        const {authorization} = request.headers;
        if (!authorization || authorization?.trim() === "")
            throw new UnauthorizedException("you need to provide a valid token");
        const [bearer, token] = authorization.split(" ");
        if (bearer.toLowerCase() !== "bearer" || !token || !isJWT(token))
            throw new UnauthorizedException("you need to provide a valid token");
        return token;
    }
}
