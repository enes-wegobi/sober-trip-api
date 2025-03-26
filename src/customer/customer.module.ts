import { Module } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { MapClient } from "src/common/client/map.client";
import { ConfigModule } from "src/config/config.module";
import { TripModule } from "src/trip/trip.module";
import { NotificationClient } from "src/common/client/notification.client";

@Module({
    imports: [ConfigModule,
      TripModule,
    ],
    providers: [CustomerService, MapClient, NotificationClient],
    controllers: [CustomerController],
    exports: [CustomerService],
  })
  export class CustomerModule {}
  