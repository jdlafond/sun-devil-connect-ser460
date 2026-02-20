-- Moderation cases
CREATE TABLE moderation_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_ids UUID[] NOT NULL,
  admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  decision_summary TEXT,
  actions_taken JSONB,
  status moderation_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_moderation_cases_admin ON moderation_cases(admin_user_id);
CREATE INDEX idx_moderation_cases_status ON moderation_cases(status);
