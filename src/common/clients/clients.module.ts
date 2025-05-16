import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsService } from './clients.service';
import { CustomersClient } from './customer/customers.client';
import { DriversClient } from './driver/drivers.client';

@Module({
  imports: [ConfigModule],
  providers: [ClientsService, CustomersClient, DriversClient],
  exports: [ClientsService, CustomersClient, DriversClient],
})
export class ClientsModule {}
