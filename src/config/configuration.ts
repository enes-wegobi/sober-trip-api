export default () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_USER: process.env.MONGODB_USER,
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
  //NOTIFICATION_API_URL: process.env.NOTIFICATION_API_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8080',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
});
