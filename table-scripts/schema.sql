-- ============================================
-- Sun Devil Connect - Complete Database Schema
-- ============================================

-- Enum types
CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN', 'ORGANIZER');
CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
CREATE TYPE organization_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
CREATE TYPE flag_status AS ENUM ('OPEN', 'CLOSED', 'UNDER_REVIEW');
CREATE TYPE flag_target_type AS ENUM ('EVENT', 'ANNOUNCEMENT', 'ORGANIZATION', 'USER');
CREATE TYPE moderation_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE digest_frequency AS ENUM ('DAILY', 'WEEKLY', 'NONE');
CREATE TYPE category AS ENUM ('Academic', 'Social', 'Greek Life', 'Cultural', 'Sports', 'Arts', 'Service', 'Professional');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role user_role NOT NULL,
  interests category[],
  notification_settings JSONB DEFAULT '{}',
  major TEXT,
  graduation_year INTEGER,
  department TEXT,
  permissions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  categories TEXT[],
  status organization_status NOT NULL DEFAULT 'PENDING',
  logo_url TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_status ON organizations(status);

-- Organization members (many-to-many)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(org_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  capacity INTEGER,
  registration_cutoff_at TIMESTAMPTZ,
  status event_status NOT NULL DEFAULT 'DRAFT',
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_org ON events(org_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_at ON events(start_at);

-- Event registrations (many-to-many)
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended BOOLEAN DEFAULT FALSE,
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_org ON announcements(org_id);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

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

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
