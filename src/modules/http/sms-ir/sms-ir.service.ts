import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import * as process from "node:process";
import {catchError, lastValueFrom, map} from "rxjs";
import {SmsTemplate} from "../enum/sms-template.enum";

@Injectable()
export class SmsIrService {
  constructor(private httpService: HttpService) {
  }

  async sendVerificationCode(mobile: string, code: string) {
    const {SMS_IR_VERIFY_SEND_URL, SMS_IR_API_KEY} = process.env
    const {VERIFY_CODE} = SmsTemplate
    const requestBody = {
      mobile,
      templateId: VERIFY_CODE,
      parameters: [
        {
          name: "CODE",
          value: code
        }
      ]
    }
    console.log(requestBody)
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-api-key": SMS_IR_API_KEY
    }
    const result = await lastValueFrom(this.httpService.post(SMS_IR_VERIFY_SEND_URL, requestBody, {headers})
      .pipe(
        map(result => result.data),
      ).pipe(
        catchError((error) => {
          console.log(error.data)
          throw new InternalServerErrorException(`SMS IR ${error}`)
        })
      )
    )
    return result
  }
}
