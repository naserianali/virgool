import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request } from "express";
import { AuthService } from "../../../modules/auth/auth.service";
import { isJWT } from "class-validator";

@Injectable()
export class AddUserToRequestWovMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);
    if (!token) return next();
    try {
      let user = await this.authService.validateToken(token);
      if (user) req.user = user;
    } catch (error) {}
    next();
  }

  protected extractToken(request: Request) {
    const { authorization } = request.headers;
    if (!authorization || authorization?.trim() === "") {
      return null;
    }
    const [bearer, token] = authorization.split(" ");
    if (bearer.toLowerCase() !== "bearer" || !token || !isJWT(token)) {
      return null;
    }
    return token;
  }
}
