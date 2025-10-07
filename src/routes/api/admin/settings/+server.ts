import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase';
import { clearSettingsCache } from '$lib/server/settings';

// GET - Fetch all settings
export const GET: RequestHandler = async ({ platform, fetch }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true });

    if (error) {
      console.error('Error fetching settings:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    // Group settings by category
    const grouped = settings?.reduce((acc: any, setting: any) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        key: setting.setting_key,
        value: setting.setting_value,
        description: setting.description,
        updatedAt: setting.updated_at
      });
      return acc;
    }, {});

    return json({ success: true, settings: grouped });
  } catch (err) {
    console.error('Settings error:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};

// PATCH - Update a setting
export const PATCH: RequestHandler = async ({ request, platform, fetch, locals }) => {
  try {
    const body = await request.json();
    const { setting_key, setting_value } = body;

    if (!setting_key || setting_value === undefined) {
      return json({ success: false, error: 'Missing setting_key or setting_value' }, { status: 400 });
    }

    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Get current user (admin)
    const { data: { user } } = await supabase.auth.getUser();

    // Update the setting
    const { error } = await supabase
      .from('site_settings')
      .update({
        setting_value,
        updated_by: user?.id || null,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', setting_key);

    if (error) {
      console.error('Error updating setting:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    // Clear settings cache after update
    clearSettingsCache();

    return json({ success: true, message: 'Setting updated successfully' });
  } catch (err) {
    console.error('Update setting error:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};

// POST - Reset all settings to defaults
export const POST: RequestHandler = async ({ platform, fetch }) => {
  try {
    const env = (platform?.env as Record<string, string>) || process.env as Record<string, string>;
    const supabase = createSupabaseAdminClient(fetch, env);

    // Get current user (admin)
    const { data: { user } } = await supabase.auth.getUser();

    // Define default values
    const defaults = [
      { key: 'registration_enabled', value: true },
      { key: 'chat_enabled', value: true },
      { key: 'image_sharing_enabled', value: true },
      { key: 'reporting_enabled', value: true },
      { key: 'feedback_enabled', value: true },
      { key: 'maintenance_mode', value: false },
      { key: 'messages_per_minute', value: 25 },
      { key: 'max_message_length', value: 160 },
      { key: 'image_upload_size_mb', value: 5 },
      { key: 'feedback_cooldown_hours', value: 3 },
      { key: 'max_reports_per_day', value: 10 },
      { key: 'images_per_day', value: 15 },
      { key: 'profanity_filter_enabled', value: false },
      { key: 'link_blocking_enabled', value: false },
      { key: 'auto_ban_keywords', value: [] },
      { key: 'auto_flag_keywords', value: [] },
      { key: 'minimum_age', value: 18 },
      { key: 'maximum_age', value: 90 },
      { key: 'gender_required', value: true },
      { key: 'country_whitelist', value: [] },
      { key: 'country_blacklist', value: [] },
      { key: 'max_active_conversations', value: 5 },
      { key: 'message_retention_hours', value: 8 },
      { key: 'typing_indicator_enabled', value: true },
      { key: 'read_receipts_enabled', value: true },
      { key: 'online_status_visible', value: true },
      { key: 'site_name', value: 'ChatWii' },
      { key: 'support_email', value: 'support@chatwii.com' },
      { key: 'session_timeout_hours', value: 24 },
      { key: 'announcement_enabled', value: false },
      { key: 'announcement_message', value: '' },
      { key: 'announcement_type', value: 'info' }
    ];

    // Update all settings to defaults
    for (const { key, value } of defaults) {
      await supabase
        .from('site_settings')
        .update({
          setting_value: value,
          updated_by: user?.id || null,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);
    }

    // Clear settings cache after reset
    clearSettingsCache();

    return json({ success: true, message: 'All settings reset to defaults' });
  } catch (err) {
    console.error('Reset settings error:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
