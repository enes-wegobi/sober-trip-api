import { Injectable, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { ClientsService } from '../clients.service';

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
}
