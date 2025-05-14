export default () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_USER: process.env.MONGODB_USER,
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
  //NOTIFICATION_API_URL: process.env.NOTIFICATION_API_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8080',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  TRIP_COST_PER_MINUTE: parseFloat(process.env.TRIP_COST_PER_MINUTE || '1'),
  // Valkey DB configuration
  VALKEY_HOST: process.env.VALKEY_HOST || 'localhost',
  VALKEY_PORT: parseInt(process.env.VALKEY_PORT || '6379', 10),
  VALKEY_PASSWORD: process.env.VALKEY_PASSWORD,
  VALKEY_USERNAME: process.env.VALKEY_USERNAME,
  VALKEY_TLS: process.env.VALKEY_TLS || 'false',
});
