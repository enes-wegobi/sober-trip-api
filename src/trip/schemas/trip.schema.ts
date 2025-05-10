import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TripStatus } from '../../common/enums/trip-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { RoutePoint, RoutePointSchema } from './route-point.schema';

export type TripDocument = Trip & Document;

@Schema({ timestamps: true })
export class Trip {
  @Prop({ required: true })
  customerId: string;

  @Prop()
  driverId: string;

  @Prop({ enum: TripStatus, default: TripStatus.DRAFT })
  status: TripStatus;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Prop()
  paymentMethodId: string;

  @Prop()
  rating: number;

  @Prop()
  comment: string;

  @Prop({ type: [{ type: RoutePointSchema }] })
  route: RoutePoint[];

  @Prop()
  estimatedDistance: number; // meters

  @Prop()
  estimatedDuration: number; // seconds

  @Prop()
  estimatedCost: number;

  //TODO: red eden driveridlerini
}

export const TripSchema = SchemaFactory.createForClass(Trip);

// Create compound indexes for active trips
// This ensures a customer can only have one active trip at a time
TripSchema.index(
  { customerId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: TripStatus.WAITING_FOR_DRIVER },
  },
);

// This ensures a driver can only have one active trip at a time
TripSchema.index(
  { driverId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: TripStatus.APPROVED } },
);
