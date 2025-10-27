
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DokicasaModule } from './dokicasa/dokicasa.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: parseInt(process.env.DOKICASA_TIMEOUT_MS || '15000', 10),
      maxRedirects: 3,
    }),
    DokicasaModule,
  ],
})
export class AppModule {}
