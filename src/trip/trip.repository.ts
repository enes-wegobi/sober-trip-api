import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './schemas/trip.schema';
import { TripStatus } from '../common/enums/trip-status.enum';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripRepository {
  constructor(
    @InjectModel(Trip.name)
    private readonly tripModel: Model<TripDocument>,
  ) {}

  async createTrip(tripData: CreateTripDto): Promise<TripDocument> {
    const createdTrip = new this.tripModel({
      ...tripData,
    });
    return createdTrip.save();
  }

  async findById(tripId: string): Promise<TripDocument | null> {
    return this.tripModel.findById({ _id: tripId });
  }

  async findByIdAndUpdate(
    _id: any,
    tripData: UpdateTripDto,
  ): Promise<TripDocument | null> {
    return this.tripModel.findByIdAndUpdate(
      _id,
      {
        ...tripData,
      },
      { new: true },
    );
  }

  async findLatestPendingByCustomerId(
    customerId: string,
  ): Promise<TripDocument | null> {
    return this.tripModel
      .findOne({
        customerId,
        status: TripStatus.DRAFT,
        driverId: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveByCustomerId(
    customerId: string,
  ): Promise<TripDocument | null> {
    return this.tripModel
      .findOne({
        customerId,
        status: TripStatus.WAITING_FOR_DRIVER,
      })
      .exec();
  }

  async findActiveByDriverId(
    driverId: string,
  ): Promise<TripDocument | null> {
    return this.tripModel
      .findOne({
        driverId,
        status: TripStatus.APPROVED,
      })
      .exec();
  }
}
