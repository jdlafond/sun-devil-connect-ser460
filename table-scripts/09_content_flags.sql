-- Content flags
CREATE TABLE content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type flag_target_type NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status flag_status NOT NULL DEFAULT 'OPEN'
);

CREATE INDEX idx_content_flags_reporter ON content_flags(reporter_user_id);
CREATE INDEX idx_content_flags_target ON content_flags(target_type, target_id);
CREATE INDEX idx_content_flags_status ON content_flags(status);
