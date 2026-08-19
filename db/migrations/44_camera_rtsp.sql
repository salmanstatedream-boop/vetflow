-- Extend camera_devices for RTSP credentials + media gateway integration

ALTER TABLE public.camera_devices
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS protocol VARCHAR(20) NOT NULL DEFAULT 'rtsp',
    ADD COLUMN IF NOT EXISTS host VARCHAR(255),
    ADD COLUMN IF NOT EXISTS port INTEGER NOT NULL DEFAULT 554,
    ADD COLUMN IF NOT EXISTS stream_path TEXT,
    ADD COLUMN IF NOT EXISTS username_enc TEXT,
    ADD COLUMN IF NOT EXISTS password_enc TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'unknown'
        CHECK (status IN ('unknown', 'online', 'offline', 'auth_failed', 'unreachable'));
