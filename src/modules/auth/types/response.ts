import {AuthMethod} from "../enums/method.enum";

export type AuthResponse = {
  token: string
  code: string
  method: AuthMethod,
  username?: string
}

export type GoogleUser = {
  firstName?: string,
  lastName?: string,
  email: string,
  accessToken?: string,
  image:string
}