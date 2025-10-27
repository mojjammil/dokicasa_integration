import { Body, Controller, Post } from '@nestjs/common';
import { DokicasaService } from './dokicasa.service';
import { SubmitClientPayloadDto } from './dto/submit-client-payload.dto';

@Controller()
export class DokicasaController {
  constructor(private readonly service: DokicasaService) {}

  /** POST /api/v1/submit-contract-info */
  @Post('submit-contract-info')
  submit(@Body() dto: SubmitClientPayloadDto) {
    return this.service.submitContractInfo(dto);
  }
}
