/**
 * Site Settings Helper
 * Provides safe access to site settings with fallbacks to hardcoded defaults
 * If database is unavailable or settings don't exist, uses safe defaults
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// Default values (current hardcoded behavior)
const DEFAULTS = {
  // Features
  registration_enabled: true,
  chat_enabled: true,
  image_sharing_enabled: true,
  reporting_enabled: true,
  feedback_enabled: true,
  maintenance_mode: false,

  // Rate Limits
  messages_per_minute: 25,
  max_message_length: 160,
  image_upload_size_mb: 5,
  feedback_cooldown_hours: 3,
  max_reports_per_day: 10,
  images_per_day: 15,

  // Content Moderation
  profanity_filter_enabled: false,
  link_blocking_enabled: false,
  auto_ban_keywords: [] as string[],
  auto_flag_keywords: [] as string[],

  // User Settings
  minimum_age: 18,
  maximum_age: 90,
  gender_required: true,
  country_whitelist: [] as string[],
  country_blacklist: [] as string[],

  // Chat Settings
  max_active_conversations: 5,
  message_retention_hours: 8,
  typing_indicator_enabled: true,
  read_receipts_enabled: true,
  online_status_visible: true,

  // System
  site_name: 'ChatWii',
  support_email: 'support@chatwii.com',
  session_timeout_hours: 24,
  announcement_enabled: false,
  announcement_message: '',
  announcement_type: 'info' as 'info' | 'warning' | 'success' | 'error'
};

type SettingsKey = keyof typeof DEFAULTS;

// In-memory cache (expires after 5 minutes)
let settingsCache: typeof DEFAULTS | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get a specific setting value with fallback to default
 * @param supabase - Supabase client
 * @param key - Setting key
 * @returns Setting value or default
 */
export async function getSetting<K extends SettingsKey>(
  supabase: SupabaseClient,
  key: K
): Promise<typeof DEFAULTS[K]> {
  try {
    // Check cache first
    if (settingsCache && Date.now() < cacheExpiry) {
      return settingsCache[key];
    }

    // Fetch from database with timeout
    const { data, error } = await Promise.race([
      supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .single(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Settings timeout')), 2000)
      )
    ]) as any;

    if (error || !data) {
      console.warn(`Setting ${key} not found, using default:`, DEFAULTS[key]);
      return DEFAULTS[key];
    }

    // Parse JSONB value
    return data.setting_value ?? DEFAULTS[key];
  } catch (error) {
    console.error(`Error fetching setting ${key}, using default:`, error);
    return DEFAULTS[key];
  }
}

/**
 * Get all settings with fallback to defaults
 * @param supabase - Supabase client
 * @returns All settings or defaults
 */
export async function getAllSettings(
  supabase: SupabaseClient
): Promise<typeof DEFAULTS> {
  try {
    // Check cache first
    if (settingsCache && Date.now() < cacheExpiry) {
      return settingsCache;
    }

    // Fetch all settings from database with timeout
    const { data, error } = await Promise.race([
      supabase.from('site_settings').select('setting_key, setting_value'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Settings timeout')), 2000)
      )
    ]) as any;

    if (error || !data) {
      console.warn('Settings not found, using defaults');
      return DEFAULTS;
    }

    // Build settings object with defaults as fallback
    const settings = { ...DEFAULTS };

    data.forEach((row: any) => {
      const key = row.setting_key as SettingsKey;
      if (key in settings) {
        settings[key] = row.setting_value ?? DEFAULTS[key];
      }
    });

    // Update cache
    settingsCache = settings;
    cacheExpiry = Date.now() + CACHE_DURATION;

    return settings;
  } catch (error) {
    console.error('Error fetching settings, using defaults:', error);
    return DEFAULTS;
  }
}

/**
 * Clear settings cache (call after updating settings)
 */
export function clearSettingsCache(): void {
  settingsCache = null;
  cacheExpiry = 0;
}

/**
 * Check if a feature is enabled
 * @param supabase - Supabase client
 * @param feature - Feature key
 * @returns Whether feature is enabled
 */
export async function isFeatureEnabled(
  supabase: SupabaseClient,
  feature: 'registration' | 'chat' | 'image_sharing' | 'reporting' | 'feedback'
): Promise<boolean> {
  const key = `${feature}_enabled` as SettingsKey;
  return await getSetting(supabase, key);
}

/**
 * Check if site is in maintenance mode
 * @param supabase - Supabase client
 * @returns Whether maintenance mode is active
 */
export async function isMaintenanceMode(
  supabase: SupabaseClient
): Promise<boolean> {
  return await getSetting(supabase, 'maintenance_mode');
}

/**
 * Get rate limit value
 * @param supabase - Supabase client
 * @param limit - Limit type
 * @returns Limit value
 */
export async function getRateLimit(
  supabase: SupabaseClient,
  limit: 'messages_per_minute' | 'max_message_length' | 'image_upload_size_mb' |
         'feedback_cooldown_hours' | 'max_reports_per_day' | 'images_per_day'
): Promise<number> {
  return await getSetting(supabase, limit);
}
