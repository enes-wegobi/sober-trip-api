import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DriverDto } from './driver.dto';

export class RejectDriverDto {
  @ApiProperty({
    description: 'Trip ID',
    example: '60a1b2c3d4e5f6a7b8c9d0e1',
  })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({
    description: 'Driver ID to reject',
    example: '60a1b2c3d4e5f6a7b8c9d0e3',
  })
  @IsNotEmpty()
  @IsString()
  driverId: string;
}
