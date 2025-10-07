-- ============================================
-- LINK BLOCKING FOR MESSAGES
-- Automatically replaces links with www.chatwii.com when enabled
-- ============================================

-- Function to check and sanitize message content based on settings
CREATE OR REPLACE FUNCTION sanitize_message_content()
RETURNS TRIGGER AS $$
DECLARE
  v_link_blocking_enabled BOOLEAN;
  v_sanitized_content TEXT;
BEGIN
  -- Get link blocking setting (default to false)
  SELECT COALESCE((setting_value)::boolean, false)
  INTO v_link_blocking_enabled
  FROM site_settings
  WHERE setting_key = 'link_blocking_enabled';

  -- If link blocking is enabled, replace all links with www.chatwii.com
  IF v_link_blocking_enabled THEN
    v_sanitized_content := NEW.content;

    -- Replace common URL patterns with www.chatwii.com
    -- Match http://, https://, www., and common TLDs
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

    NEW.content := v_sanitized_content;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sanitize messages before insert
DROP TRIGGER IF EXISTS sanitize_message_trigger ON messages;
CREATE TRIGGER sanitize_message_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_message_content();

COMMENT ON FUNCTION sanitize_message_content() IS 'Sanitizes message content based on site settings (link blocking, profanity filter, etc)';
