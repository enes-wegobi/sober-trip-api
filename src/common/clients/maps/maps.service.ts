import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import axios from 'axios';
import { Coordinates, DistanceResponse } from './maps.interface';

@Injectable()
export class MapsService {
  constructor(private configService: ConfigService) {}

  async getDistanceMatrix(
    origin: Coordinates,
    destination: Coordinates,
  ): Promise<DistanceResponse> {
    try {
      if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
        return {
          success: false,
          message: 'Geçersiz istek. Origin ve destination koordinatları gerekli.',
        };
      }

      // Format coordinates for Google Maps API
      const originCoords = `${origin.lat},${origin.lng}`;
      const destCoords = `${destination.lat},${destination.lng}`;

      // Send request to Google Distance Matrix API
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: originCoords,
          destinations: destCoords,
          key: this.configService.googleMapsApiKey,
        },
      });

      // Check API response
      if (response.data.status !== 'OK') {
        return {
          success: false,
          message: `Google API error:${response.data.status}`,
        };
      }

      // Extract distance and duration information
      const distanceData = response.data.rows[0].elements[0];

      // Return successful response
      return {
        success: true,
        origin: {
          coordinates: originCoords,
          address: response.data.origin_addresses[0],
        },
        destination: {
          coordinates: destCoords,
          address: response.data.destination_addresses[0],
        },
        distance: {
          text: distanceData.distance.text,
          value: distanceData.distance.value, // meters
        },
        duration: {
          text: distanceData.duration.text,
          value: distanceData.duration.value, // seconds
        },
      };
    } catch (error) {
      console.error('Maps Service Error:', error.message);
      return {
        success: false,
        message: 'Maps Service Error',
        error: error.message,
      };
    }
  }
}
