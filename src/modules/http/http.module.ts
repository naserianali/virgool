import {Global, Module} from '@nestjs/common';
import {HttpService} from './http.service';
import {SmsIrService} from './sms-ir/sms-ir.service';
import {HttpModule} from "@nestjs/axios";

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000
    })
  ],
  providers: [HttpService, SmsIrService],
  exports:[SmsIrService]
})
export class CustomHttpModule {
}
