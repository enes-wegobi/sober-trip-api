import { Injectable } from "@nestjs/common";
import { TripRepository } from "./trip.repository";
import { CreateTripDto } from "./dto/create-trip.dto";
import { TripDocument } from "./schemas/trip.schema";
import { UpdateTripDto } from "./dto/update-trip.dto";
import { TripStatus } from "src/common/enums/trip-status.enum";

@Injectable()
export class TripService {
    constructor(
        private readonly tripRepository: TripRepository,
      ) {}


  async findTrip(tripId: string) {
    return this.tripRepository.findById(tripId);
  }

  async findLatestPendingByCustomerId(customerId: string) {
    return this.tripRepository.findLatestPendingByCustomerId(customerId);
  }

  async createTrip(tripData: CreateTripDto): Promise<TripDocument> {
    return this.tripRepository.createTrip(tripData);
  }

  async updatetrip(_id: any, tripData: UpdateTripDto): Promise<TripDocument | null>{
    return this.tripRepository.findByIdAndUpdate(_id, tripData);
  }

  async completeTrip(_id: string): Promise<TripDocument | null>{
    return this.tripRepository.findByIdAndUpdate(_id, { status: TripStatus.PAYMENT_PENDING });
  }

}