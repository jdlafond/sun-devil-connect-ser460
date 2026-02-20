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
