import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UpdateTripDto } from './dto/update-trip.dto';

@WebSocketGateway()
export class TripGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  sendTripToDriver(trip: UpdateTripDto) {
    // "sendTripToDriver" event'i ile güncellenmiş trip bilgisini yayınlıyoruz.
    this.server.emit('driverFound', trip);
  }

  sendTripNotifToCustomer(trip: UpdateTripDto) {
    this.server.emit('driverStatusUpdated', trip);
  }


  sendPaymentNotifToCustomer(trip: import("./schemas/trip.schema").TripDocument | null) {
    this.server.emit('paymentWaiting', trip);
  }
}
