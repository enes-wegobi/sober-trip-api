import { Module } from "@nestjs/common";
import { ConfigModule } from "src/config/config.module";
import { DriverService } from "./driver.service";
import { DriverController } from "./driver.controller";
import { TripModule } from "src/trip/trip.module";
import { MapClient } from "src/common/client/map.client";

@Module({
    imports: [ConfigModule,
      TripModule
    ],
    providers: [DriverService, MapClient],
    controllers: [DriverController],
    exports: [DriverService],
  })
  export class DriverModule {}
  