-- ============================================
-- FIX IMAGE URL BLOCKING
-- Allow image URLs to bypass link blocking
-- ============================================

-- Drop existing function
DROP FUNCTION IF EXISTS sanitize_message_content() CASCADE;

-- Enhanced sanitize function to exclude image messages from link blocking
CREATE OR REPLACE FUNCTION sanitize_message_content()
RETURNS TRIGGER AS $$
DECLARE
  v_link_blocking_enabled BOOLEAN;
  v_max_message_length INTEGER;
  v_sanitized_content TEXT;
BEGIN
  -- Get settings (with fallbacks)
  SELECT
    COALESCE((SELECT setting_value::boolean FROM site_settings WHERE setting_key = 'link_blocking_enabled'), false),
    COALESCE((SELECT setting_value::integer FROM site_settings WHERE setting_key = 'max_message_length'), 160)
  INTO
    v_link_blocking_enabled,
    v_max_message_length;

  v_sanitized_content := NEW.content;

  -- Enforce max message length
  IF LENGTH(v_sanitized_content) > v_max_message_length THEN
    RAISE EXCEPTION 'Message too long (max % characters)', v_max_message_length;
  END IF;

  -- IMPORTANT: Skip link blocking for image messages
  -- Image messages contain ImageKit URLs that should not be replaced
  IF v_link_blocking_enabled AND NEW.message_type != 'image' THEN
    -- Replace http://, https://, www., and common TLDs
    v_sanitized_content := regexp_replace(
      v_sanitized_content,
      'https?://[^\s]+',
      'www.chatwii.com',
      'gi'
    );

    v_sanitized_content := regexp_replace(
      v_sanitized_content,
      'www\.[^\s]+',
      'www.chatwii.com',
      'gi'
    );

    v_sanitized_content := regexp_replace(
      v_sanitized_content,
      '\b[a-zA-Z0-9-]+\.(com|org|net|io|co|app|dev|xyz|me|info|biz|tv|online|site|live|tech|store|blog|web|cc|us|uk|ca|au|de|fr|jp|cn|ru|br|in|mx|nl|se|no|fi|dk|pl|it|es|pt|ch|at|be|cz|gr|hu|ie|ro|sk|bg|hr|lt|lv|ee|si|lu|cy|mt)\b',
      'www.chatwii.com',
      'gi'
    );
  END IF;

  NEW.content := v_sanitized_content;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS sanitize_message_trigger ON messages;
CREATE TRIGGER sanitize_message_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_message_content();

COMMENT ON FUNCTION sanitize_message_content() IS 'Validates message length and sanitizes content based on site settings (link blocking for text messages only, excludes images)';
