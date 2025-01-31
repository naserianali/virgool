import {UserEntity} from "../../modules/user/entities/user.entity";

declare global {
  namespace Express {
    export interface Request {
      user?: UserEntity;
    }
  }
}
declare module "express-serve-static-core" {
  export interface Request {
    user?: UserEntity;
  }
}
