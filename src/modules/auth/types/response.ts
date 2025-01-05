import {AuthMethod} from "../enums/method.enum";

export type AuthResponse = {
    token: string
    code: string
    method: AuthMethod
}