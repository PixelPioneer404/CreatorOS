import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional().default(''),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  AI_PROVIDER: z.string().default('gemini'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('gemini-1.5-flash'),
  TOKEN_ENCRYPTION_KEY: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
export const isDev = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test';
export const isProd = config.NODE_ENV === 'production';
