export enum TripStatus {
    PENDING = 'PENDING',
    WAITING = 'WAITING', // Şoför bekleniyor
    ACCEPTED = 'ACCEPTED', 
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    DRIVER_ON_WAY = 'DRIVER_ON_WAY',
    DRIVER_REACHED = 'DRIVER_REACHED',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
    // Diğer durumlar (örneğin: şoför yola çıktı, varış noktasına ulaştı vb.) eklenebilir.
  }
  