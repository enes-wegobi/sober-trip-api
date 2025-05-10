import { IsNotEmpty, IsString, IsArray, ValidateNested, ArrayMinSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
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

export class EstimateTripDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => RoutePointDto)
  routePoints: RoutePointDto[];
}
