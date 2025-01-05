import {AuthMethod} from "../enums/method.enum";

export type CookiePayloadType = {
    username: string;
    method: AuthMethod
}