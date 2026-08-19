-- Camera system presets + per-channel configuration (minimal additive migration)

ALTER TABLE public.camera_devices
    ADD COLUMN IF NOT EXISTS brand VARCHAR(20) NOT NULL DEFAULT 'CUSTOM'
        CHECK (brand IN ('HIKVISION', 'DAHUA', 'UNIVIEW', 'CUSTOM')),
    ADD COLUMN IF NOT EXISTS device_type VARCHAR(20) NOT NULL DEFAULT 'NVR'
        CHECK (device_type IN ('DVR', 'XVR', 'NVR', 'IP_CAMERA')),
    ADD COLUMN IF NOT EXISTS channel_count INTEGER NOT NULL DEFAULT 1
        CHECK (channel_count >= 1 AND channel_count <= 64),
    ADD COLUMN IF NOT EXISTS preferred_grid_stream VARCHAR(10) NOT NULL DEFAULT 'sub'
        CHECK (preferred_grid_stream IN ('main', 'sub')),
    ADD COLUMN IF NOT EXISTS custom_main_path TEXT,
    ADD COLUMN IF NOT EXISTS custom_sub_path TEXT;

CREATE TABLE IF NOT EXISTS public.camera_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_device_id UUID NOT NULL REFERENCES public.camera_devices(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    channel_number INTEGER NOT NULL CHECK (channel_number >= 1 AND channel_number <= 64),
    name VARCHAR(255) NOT NULL,
    location TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (camera_device_id, channel_number)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_camera_channels_updated_at'
    ) THEN
        CREATE TRIGGER update_camera_channels_updated_at
            BEFORE UPDATE ON public.camera_channels
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_camera_channels_device ON public.camera_channels (camera_device_id);
CREATE INDEX IF NOT EXISTS idx_camera_channels_org_branch ON public.camera_channels (organization_id, branch_id);

ALTER TABLE public.camera_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_camera_channel ON public.camera_channels
    FOR SELECT USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND branch_id IN (SELECT public.get_user_branches())
    );

CREATE POLICY manage_camera_channel ON public.camera_channels
    FOR ALL USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND branch_id IN (SELECT public.get_user_branches())
        AND public.has_org_role(organization_id, ARRAY['clinic_admin'])
    );
