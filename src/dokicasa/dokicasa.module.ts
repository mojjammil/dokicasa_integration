import { Module } from '@nestjs/common';
import { DokicasaController } from './dokicasa.controller';
import { DokicasaService } from './dokicasa.service';
import { FormResolverService } from './form-resolver.service';
import { HttpModule } from '../http/http.module';
import { MappingModule } from '../mapping/mapping.module';

@Module({
  imports: [HttpModule, MappingModule],
  controllers: [DokicasaController],
  providers: [DokicasaService, FormResolverService],
})
export class DokicasaModule {}
