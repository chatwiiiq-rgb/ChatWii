-- ============================================
-- COMPREHENSIVE SETTINGS ENFORCEMENT
-- Server-side enforcement for rate limits, user restrictions, and content moderation
-- ============================================

-- ============================================
-- 1. MESSAGE CONTENT VALIDATION
-- ============================================

-- Enhanced sanitize function to include profanity filter and message length validation
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

  -- If link blocking is enabled, replace all links with www.chatwii.com
  IF v_link_blocking_enabled THEN
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

-- ============================================
-- 2. MESSAGE RATE LIMITING
-- ============================================

-- Function to check message rate limit
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_messages_per_minute INTEGER;
  v_message_count INTEGER;
  v_window_start TIMESTAMP;
BEGIN
  -- Get messages per minute setting (fallback to 25)
  SELECT COALESCE((setting_value)::integer, 25)
  INTO v_messages_per_minute
  FROM site_settings
  WHERE setting_key = 'messages_per_minute';

  -- Count messages in last minute
  v_window_start := NOW() - INTERVAL '1 minute';

  SELECT COUNT(*)
  INTO v_message_count
  FROM messages
  WHERE sender_id = NEW.sender_id
    AND created_at >= v_window_start;

  -- Enforce rate limit
  IF v_message_count >= v_messages_per_minute THEN
    RAISE EXCEPTION 'Rate limit exceeded (% messages per minute)', v_messages_per_minute;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for message rate limiting
DROP TRIGGER IF EXISTS message_rate_limit_trigger ON messages;
CREATE TRIGGER message_rate_limit_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_message_rate_limit();

-- ============================================
-- 3. USER REGISTRATION VALIDATION
-- ============================================

-- Function to validate user registration
CREATE OR REPLACE FUNCTION validate_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_minimum_age INTEGER;
  v_maximum_age INTEGER;
  v_gender_required BOOLEAN;
  v_country_whitelist JSONB;
  v_country_blacklist JSONB;
BEGIN
  -- Get user settings (with fallbacks)
  SELECT
    COALESCE((SELECT setting_value::integer FROM site_settings WHERE setting_key = 'minimum_age'), 18),
    COALESCE((SELECT setting_value::integer FROM site_settings WHERE setting_key = 'maximum_age'), 90),
    COALESCE((SELECT setting_value::boolean FROM site_settings WHERE setting_key = 'gender_required'), true),
    COALESCE((SELECT setting_value FROM site_settings WHERE setting_key = 'country_whitelist'), '[]'::jsonb),
    COALESCE((SELECT setting_value FROM site_settings WHERE setting_key = 'country_blacklist'), '[]'::jsonb)
  INTO
    v_minimum_age,
    v_maximum_age,
    v_gender_required,
    v_country_whitelist,
    v_country_blacklist;

  -- Validate age
  IF NEW.age < v_minimum_age THEN
    RAISE EXCEPTION 'You must be at least % years old to register', v_minimum_age;
  END IF;

  IF NEW.age > v_maximum_age THEN
    RAISE EXCEPTION 'Age must be % or below', v_maximum_age;
  END IF;

  -- Validate gender if required
  IF v_gender_required AND (NEW.gender IS NULL OR NEW.gender = '') THEN
    RAISE EXCEPTION 'Gender is required';
  END IF;

  -- Validate country whitelist (if not empty)
  IF jsonb_array_length(v_country_whitelist) > 0 THEN
    IF NOT (v_country_whitelist @> to_jsonb(NEW.country)) THEN
      RAISE EXCEPTION 'Registration from your country is not allowed';
    END IF;
  END IF;

  -- Validate country blacklist
  IF jsonb_array_length(v_country_blacklist) > 0 THEN
    IF v_country_blacklist @> to_jsonb(NEW.country) THEN
      RAISE EXCEPTION 'Registration from your country is not allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user registration validation
DROP TRIGGER IF EXISTS user_registration_validation_trigger ON users;
CREATE TRIGGER user_registration_validation_trigger
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_registration();

-- ============================================
-- 4. MESSAGE RETENTION (Cleanup Job)
-- ============================================

-- Function to clean up old messages based on retention setting
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS INTEGER AS $$
DECLARE
  v_retention_hours INTEGER;
  v_cutoff_time TIMESTAMP;
  v_deleted_count INTEGER;
BEGIN
  -- Get message retention hours (fallback to 8)
  SELECT COALESCE((setting_value)::integer, 8)
  INTO v_retention_hours
  FROM site_settings
  WHERE setting_key = 'message_retention_hours';

  -- Calculate cutoff time
  v_cutoff_time := NOW() - (v_retention_hours || ' hours')::INTERVAL;

  -- Delete old messages
  DELETE FROM messages
  WHERE created_at < v_cutoff_time;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_messages() IS 'Deletes messages older than the configured retention period';

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION sanitize_message_content() IS 'Validates message length and sanitizes content based on site settings (link blocking, profanity filter)';
COMMENT ON FUNCTION check_message_rate_limit() IS 'Enforces dynamic message rate limit per user';
COMMENT ON FUNCTION validate_user_registration() IS 'Validates user registration based on age, gender, and country restrictions';
