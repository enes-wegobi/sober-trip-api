import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TripStatus } from '../../common/enums/trip-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { RoutePoint } from '../../common/clients/maps/maps.interface';

export class RoutePointDto implements RoutePoint {
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  lon: number;

  name?: string;

  @IsNotEmpty()
  @IsNumber()
  order: number;
}

export class CreateTripDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutePointDto)
  route: RoutePointDto[];

  @IsEnum(TripStatus)
  status: TripStatus;

  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  estimatedDistance?: number;

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;
}
