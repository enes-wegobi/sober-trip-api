import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import axios, { AxiosInstance } from 'axios';
import { TripException } from '../exceptions/trip.exception';

@Injectable()
export class NotificationClient {
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get<string>('NOTIFICATION_API_URL'),
    });
  }

  async sendTripNotificationToDriver(
    driverId: string,
    tripInformations: any,
  ): Promise<any> {
    try {
      const response = await this.client.post(
        `/trip-notification-driver/${driverId}`,
        tripInformations,
      );
      return response.data;
    } catch (error) {
      throw new TripException(
        error.code || 'NOTIFICATION_ERROR',
        error.response?.data?.message || error.message,
      );
    }
  }

  async sendTripNotificationToCustomer(
    customerId: string,
    tripInformations: any,
  ): Promise<any> {
    try {
      const response = await this.client.post(
        `/trip-notification-driver/${customerId}`,
        tripInformations,
      );
      return response.data;
    } catch (error) {
      throw new TripException(
        error.code || 'NOTIFICATION_ERROR',
        error.response?.data?.message || error.message,
      );
    }
  }
}
