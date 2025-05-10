import { Module } from '@nestjs/common';
import { ConfigModule } from '../../../config/config.module';
import { MapsService } from './maps.service';

@Module({
  imports: [ConfigModule],
  providers: [MapsService],
  exports: [MapsService],
})
export class MapsModule {}
