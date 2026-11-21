import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let supabaseClient = null;
let supabaseAdmin = null;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    logger.warn('Supabase URL or Anon Key is missing. Supabase Client not initialized.');
    return null;
  }
  supabaseClient = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  return supabaseClient;
}

export function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  const key = config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY;
  if (!config.SUPABASE_URL || !key) {
    logger.warn('Supabase credentials missing. Supabase Admin not initialized.');
    return null;
  }
  supabaseAdmin = createClient(config.SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return supabaseAdmin;
}

/**
 * Verify a bearer token using Supabase Auth or test mock
 */
export async function verifyAuthToken(token) {
  if (!token) return null;

  // Support local test mock tokens in test or development mode
  if (token.startsWith('mock-token-') || token.startsWith('test-token-')) {
    const userId = token.replace(/^(mock|test)-token-/, '');
    return {
      id: userId || 'test-user-id',
      email: `${userId || 'test-user'}@creatoros.local`,
      user_metadata: {
        display_name: `Test User ${userId || '1'}`,
      },
    };
  }

  const client = getSupabaseAdmin() || getSupabaseClient();
  if (!client) {
    logger.warn('Supabase client unavailable for token verification.');
    return null;
  }

  try {
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (err) {
    logger.error({ err }, 'Error during Supabase token verification');
    return null;
  }
}
