import { Module } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { MapClient } from "src/common/client/map.client";
import { ConfigModule } from "src/config/config.module";
import { TripModule } from "src/trip/trip.module";

@Module({
    imports: [ConfigModule,
      TripModule,
    ],
    providers: [CustomerService, MapClient],
    controllers: [CustomerController],
    exports: [CustomerService],
  })
  export class CustomerModule {}
  