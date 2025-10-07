-- ============================================
-- SITE SETTINGS TABLE
-- Centralized configuration for ChatWii
-- ============================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('features', 'limits', 'moderation', 'user_settings', 'chat_settings', 'system')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON public.site_settings(category);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role manages site settings"
  ON public.site_settings
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Policy: Authenticated users can read settings (for client-side checks)
CREATE POLICY "Authenticated users can view settings"
  ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Insert default settings (matching current hardcoded behavior)
INSERT INTO public.site_settings (setting_key, setting_value, description, category) VALUES
  -- Feature Toggles
  ('registration_enabled', 'true', 'Enable/disable user registration', 'features'),
  ('chat_enabled', 'true', 'Enable/disable chat functionality', 'features'),
  ('image_sharing_enabled', 'true', 'Enable/disable image sharing in chat', 'features'),
  ('reporting_enabled', 'true', 'Enable/disable user reporting system', 'features'),
  ('feedback_enabled', 'true', 'Enable/disable feedback submissions', 'features'),
  ('maintenance_mode', 'false', 'Enable maintenance mode (shows maintenance page)', 'features'),

  -- Rate Limits
  ('messages_per_minute', '25', 'Maximum messages per user per minute', 'limits'),
  ('max_message_length', '160', 'Maximum characters per message', 'limits'),
  ('image_upload_size_mb', '5', 'Maximum image upload size in MB', 'limits'),
  ('feedback_cooldown_hours', '3', 'Hours between feedback submissions from same IP', 'limits'),
  ('max_reports_per_day', '10', 'Maximum reports a user can submit per day', 'limits'),
  ('images_per_day', '15', 'Maximum images a user can upload per day', 'limits'),

  -- Content Moderation
  ('profanity_filter_enabled', 'false', 'Enable automatic profanity filtering', 'moderation'),
  ('link_blocking_enabled', 'false', 'Block URLs in messages', 'moderation'),
  ('auto_ban_keywords', '[]', 'List of keywords that trigger automatic ban (JSON array)', 'moderation'),
  ('auto_flag_keywords', '[]', 'List of keywords that auto-flag messages (JSON array)', 'moderation'),

  -- User Settings
  ('minimum_age', '18', 'Minimum age requirement', 'user_settings'),
  ('maximum_age', '90', 'Maximum age allowed', 'user_settings'),
  ('gender_required', 'true', 'Require gender selection during registration', 'user_settings'),
  ('country_whitelist', '[]', 'List of allowed countries (empty = all allowed)', 'user_settings'),
  ('country_blacklist', '[]', 'List of blocked countries', 'user_settings'),

  -- Chat Settings
  ('max_active_conversations', '5', 'Maximum simultaneous conversations per user', 'chat_settings'),
  ('message_retention_hours', '8', 'Hours to keep messages before deletion', 'chat_settings'),
  ('typing_indicator_enabled', 'true', 'Show typing indicators', 'chat_settings'),
  ('read_receipts_enabled', 'true', 'Show read receipts', 'chat_settings'),
  ('online_status_visible', 'true', 'Show online/offline status', 'chat_settings'),

  -- System Configuration
  ('site_name', '"ChatWii"', 'Site name/title', 'system'),
  ('support_email', '"support@chatwii.com"', 'Support contact email', 'system'),
  ('session_timeout_hours', '24', 'User session timeout in hours', 'system'),
  ('announcement_enabled', 'false', 'Show site-wide announcement banner', 'system'),
  ('announcement_message', '""', 'Announcement banner message', 'system'),
  ('announcement_type', '"info"', 'Banner type: info, warning, success, error', 'system')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger to update updated_at
CREATE TRIGGER site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE public.site_settings IS 'Centralized configuration for all site settings';
COMMENT ON COLUMN public.site_settings.setting_key IS 'Unique identifier for the setting';
COMMENT ON COLUMN public.site_settings.setting_value IS 'JSON value for flexibility (string, number, boolean, array, object)';
COMMENT ON COLUMN public.site_settings.category IS 'Category for grouping settings in admin UI';
COMMENT ON COLUMN public.site_settings.updated_by IS 'Admin user who last updated this setting';
