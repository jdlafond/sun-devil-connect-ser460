-- User preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  event_categories TEXT[],
  organization_categories TEXT[],
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  digest_frequency digest_frequency DEFAULT 'WEEKLY',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
