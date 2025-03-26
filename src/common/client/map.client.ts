import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import axios, { AxiosInstance } from 'axios';
import { CreateTripDto } from 'src/trip/dto/create-trip.dto';

@Injectable()
export class MapClient {
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    // MAP_SERVICE_URL environment değişkenini ayarlayabilirsiniz,
    // aksi halde dummy veri döndüren yapı kullanılacaktır.
    this.client = axios.create({
      baseURL:
        this.configService.get<string>('MAP_API_URL') ||
        'http://dummy-map-service',
    });
  }

  async getTripInformations(tripData: CreateTripDto): Promise<any> {
    /*
    const tripInformations = await this.client.post('/trip-informations', tripData).then(async (tripInformations) => {
        return {
          estimatedTime: 10,
          estimatedCost: 100,
        }
      }).catch(err => {
        throw new TripException(
          err.code,
          err.message,
      );
    });
    */
    return {
      estimatedTime: 10,
      estimatedCost: 100,
    };
  }

  async findDriver(tripData: any): Promise<any> {
    // Gerçek map servisi entegrasyonu yapılacaksa; örneğin:
    // const response = await this.client.post('/find-driver', tripData);
    // return response.data;

    // Şimdilik dummy veri döndürülüyor:
    return {
      driverId: 'driver123',
      estimatedDistance: 5, // km cinsinden
      estimatedTime: 10, // dakika cinsinden
      estimatedCost: 50, // TL cinsinden
    };
  }
}
