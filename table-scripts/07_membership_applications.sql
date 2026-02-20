-- Membership applications
CREATE TABLE membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  state application_status NOT NULL DEFAULT 'PENDING',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);

CREATE INDEX idx_membership_applications_user ON membership_applications(user_id);
CREATE INDEX idx_membership_applications_org ON membership_applications(org_id);
CREATE INDEX idx_membership_applications_state ON membership_applications(state);
