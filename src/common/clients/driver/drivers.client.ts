import { Injectable, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { ClientsService } from '../clients.service';
import { SetActiveTripDto } from './dto/set-active-trip.dto';

@Injectable()
export class DriversClient {
  private readonly logger = new Logger(DriversClient.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly clientsService: ClientsService) {
    this.httpClient = this.clientsService.createHttpClient('users');
  }

  async findOne(id: string, fields?: string | string[]): Promise<any> {
    let url = `/drivers/${id}`;

    if (fields) {
      const fieldsParam = Array.isArray(fields) ? fields.join(',') : fields;
      url += `?fields=${encodeURIComponent(fieldsParam)}`;
    }

    const { data } = await this.httpClient.get(url);
    return data;
  }

  async setActiveTrip(driverId: string, dto: SetActiveTripDto): Promise<any> {
    this.logger.log(`Setting active trip for driver ${driverId}`);
    const { data } = await this.httpClient.put(
      `/drivers/${driverId}/active-trip`,
      dto,
    );
    this.logger.log(`Successfully set active trip for driver ${driverId}`);
    return data;
  }

  async removeActiveTrip(driverId: string): Promise<any> {
    this.logger.log(`Removing active trip for driver ${driverId}`);
    const { data } = await this.httpClient.delete(
      `/drivers/${driverId}/active-trip`,
    );
    this.logger.log(`Successfully removed active trip for driver ${driverId}`);
    return data;
  }
}
