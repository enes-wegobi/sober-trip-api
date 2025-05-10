import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoutePointDocument = RoutePoint & Document;

@Schema()
export class RoutePoint {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lon: number;

  @Prop()
  name: string;

  @Prop({ required: true })
  order: number;
}

export const RoutePointSchema = SchemaFactory.createForClass(RoutePoint);
