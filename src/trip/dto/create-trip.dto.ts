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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoutePointDto implements RoutePoint {
  @ApiProperty({ description: 'Latitude coordinate', example: 40.7128 })
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude coordinate', example: -74.006 })
  @IsNotEmpty()
  @IsNumber()
  lon: number;

  @ApiPropertyOptional({
    description: 'Location name',
    example: 'Empire State Building',
  })
  name?: string;

  @ApiProperty({ description: 'Order of the point in the route', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  order: number;
}

export class CreateTripDto {
  @ApiProperty({
    description: 'Customer ID',
    example: '60a1b2c3d4e5f6a7b8c9d0e2',
  })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiPropertyOptional({
    description: 'Driver ID',
    example: '60a1b2c3d4e5f6a7b8c9d0e3',
  })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiProperty({
    description: 'Array of route points',
    type: [RoutePointDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutePointDto)
  route: RoutePointDto[];

  @ApiProperty({
    description: 'Trip status',
    enum: TripStatus,
    example: TripStatus.DRAFT,
  })
  @IsEnum(TripStatus)
  status: TripStatus;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.UNPAID,
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Payment method ID',
    example: 'pm_1234567890',
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiPropertyOptional({ description: 'Trip rating', example: 4.5 })
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({
    description: 'Trip comment',
    example: 'Great service!',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Estimated distance in meters',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  estimatedDistance?: number;

  @ApiPropertyOptional({
    description: 'Estimated duration in seconds',
    example: 1200,
  })
  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Estimated cost', example: 20 })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;
}
