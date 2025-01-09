import { AuthMethod } from "../enums/method.enum";

export type CookiePayloadType = {
  username: string;
  method: AuthMethod;
  userId: string;
};

export type AccessTokenPayloadType = Pick<CookiePayloadType, "userId">;

export type EmailTokenPayloadType = {
  email: string;
  method: AuthMethod;
};

export type PhoneTokenPayloadType = {
  phone: string;
  method: AuthMethod;
};
