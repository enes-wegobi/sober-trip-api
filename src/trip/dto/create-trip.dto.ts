import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { TripStatus } from '../../common/enums/trip-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export class CreateTripDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsArray()
  stops: any[];

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

  //
}
