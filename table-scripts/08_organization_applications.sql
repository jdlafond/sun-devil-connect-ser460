-- Organization applications
CREATE TABLE organization_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposed_organization JSONB NOT NULL,
  justification TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  review JSONB,
  state application_status NOT NULL DEFAULT 'PENDING',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);

CREATE INDEX idx_org_applications_submitted_by ON organization_applications(submitted_by);
CREATE INDEX idx_org_applications_state ON organization_applications(state);
