import { z } from 'zod';

const Environment = z.enum(['development', 'production', 'test']);

const envSchema = z.object({
  NODE_ENV: Environment.optional().default('development'),
  PORT: z.coerce.number().int().positive().optional().default(3000),
  MONGODB_URI: z.string().url(),
  MONGODB_USER: z.string().min(1),
  MONGODB_PASSWORD: z.string().min(1),
  //NOTIFICATION_API_URL: z.string().url(),
  CORS_ORIGIN: z.string().optional().default('http://localhost:8080'),
  GOOGLE_MAPS_API_KEY: z.string().min(1),
  TRIP_COST_PER_MINUTE: z.coerce.number().positive().optional().default(1),
  // Valkey DB configuration
  VALKEY_HOST: z.string().optional().default('localhost'),
  VALKEY_PORT: z.coerce.number().int().positive().optional().default(6379),
  VALKEY_PASSWORD: z.string().optional(),
  VALKEY_USERNAME: z.string().optional(),
  VALKEY_TLS: z.string().optional().default('false'),
});

export type EnvironmentVariables = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  try {
    const validatedConfig = envSchema.parse(config);
    return validatedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        'Config validation error:',
        JSON.stringify(error.format(), null, 2),
      );
      const errorMessages = error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      throw new Error(`Configuration validation failed: ${errorMessages}`);
    }
    throw error;
  }
}
