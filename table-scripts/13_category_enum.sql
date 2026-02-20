-- Add category enum type
CREATE TYPE category AS ENUM ('Academic', 'Social', 'Greek Life', 'Cultural', 'Sports', 'Arts', 'Service', 'Professional');

-- Update users table to use category array for interests
ALTER TABLE users ALTER COLUMN interests TYPE category[] USING interests::category[];
