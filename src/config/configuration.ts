export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigins:
    process.env.CORS_ORIGINS ||
    process.env.CORS_ORIGIN ||
    'http://localhost:8080',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  tripCostPerMinute: parseFloat(process.env.TRIP_COST_PER_MINUTE || '1'),
  nodeEnv: process.env.NODE_ENV || 'development',
  services: {
    users: {
      url: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.USERS_SERVICE_TIMEOUT || '30000', 10),
      retryCount: parseInt(process.env.USERS_SERVICE_RETRY_COUNT || '3', 10),
      retryDelay: parseInt(process.env.USERS_SERVICE_RETRY_DELAY || '1000', 10),
    },
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
  },
  valkey: {
    host: process.env.VALKEY_HOST || 'localhost',
    port: parseInt(process.env.VALKEY_PORT || '6379', 10),
    password: process.env.VALKEY_PASSWORD,
    username: process.env.VALKEY_USERNAME,
    tls: process.env.VALKEY_TLS || 'false',
  },
});
