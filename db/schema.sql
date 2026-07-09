CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS rsvps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    full_name text NOT NULL,
    email text NOT NULL,
    attending boolean NOT NULL,
    guest_count smallint NOT NULL DEFAULT 0,
    meal_preference text,
    message text
);

CREATE INDEX IF NOT EXISTS rsvps_created_at_idx ON rsvps (created_at DESC);
