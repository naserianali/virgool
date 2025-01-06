import { AuthMethod } from "../enums/method.enum";

export type CookiePayloadType = {
  username: string;
  method: AuthMethod;
  userId: string;
};

export type AccessTokenPayloadType = Pick<CookiePayloadType, 'userId'>
