import { Injectable, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { ClientsService } from '../clients.service';
import { SetActiveTripDto } from './dto/set-active-trip.dto';

@Injectable()
export class CustomersClient {
  private readonly logger = new Logger(CustomersClient.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly clientsService: ClientsService) {
    this.httpClient = this.clientsService.createHttpClient('users');
  }

  async findOne(id: string, fields?: string | string[]): Promise<any> {
    let url = `/customers/${id}`;

    if (fields) {
      const fieldsParam = Array.isArray(fields) ? fields.join(',') : fields;
      url += `?fields=${encodeURIComponent(fieldsParam)}`;
    }

    const { data } = await this.httpClient.get(url);
    return data;
  }

  async setActiveTrip(customerId: string, dto: SetActiveTripDto): Promise<any> {
    this.logger.log(`Setting active trip for customer ${customerId}`);
    const { data } = await this.httpClient.put(
      `/customers/${customerId}/active-trip`,
      dto,
    );
    this.logger.log(`Successfully set active trip for customer ${customerId}`);
    return data;
  }

  async removeActiveTrip(customerId: string): Promise<any> {
    this.logger.log(`Removing active trip for customer ${customerId}`);
    const { data } = await this.httpClient.delete(
      `/customers/${customerId}/active-trip`,
    );
    this.logger.log(
      `Successfully removed active trip for customer ${customerId}`,
    );
    return data;
  }
}
