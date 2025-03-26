import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TripStatus } from '../../common/enums/trip-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export type TripDocument = Trip & Document;

@Schema({ timestamps: true })
export class Trip {
  @Prop({ required: true })
  customerId: string;

  @Prop()
  driverId: string;

  @Prop({ type: [Object] })
  stops: any[];

  @Prop({ enum: TripStatus, default: TripStatus.PENDING })
  status: TripStatus;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Prop()
  paymentMethodId: string;

  @Prop()
  rating: number;

  @Prop()
  comment: string;

  //TODO: add estimated trip time and cost
}

export const TripSchema = SchemaFactory.createForClass(Trip);
