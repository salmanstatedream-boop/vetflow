-- Prevent double-booking for doctor-assigned upcoming appointments (duration-aware).

CREATE OR REPLACE FUNCTION public.check_appointment_doctor_slot_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  conflict_id UUID;
  new_duration INTEGER;
  new_start TIME;
  new_end TIME;
BEGIN
  IF NEW.doctor_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('requested', 'confirmed', 'rescheduled', 'checked_in') THEN
    RETURN NEW;
  END IF;

  new_duration := COALESCE(NEW.duration_minutes, 30);
  new_start := NEW.preferred_time;
  new_end := NEW.preferred_time + (new_duration || ' minutes')::INTERVAL;

  SELECT a.id
  INTO conflict_id
  FROM public.appointments a
  WHERE a.organization_id = NEW.organization_id
    AND a.branch_id = NEW.branch_id
    AND a.doctor_id = NEW.doctor_id
    AND a.preferred_date = NEW.preferred_date
    AND a.status IN ('requested', 'confirmed', 'rescheduled', 'checked_in')
    AND (TG_OP = 'INSERT' OR a.id <> NEW.id)
    AND a.preferred_time < new_end
    AND new_start < (a.preferred_time + (COALESCE(a.duration_minutes, 30) || ' minutes')::INTERVAL)
  LIMIT 1;

  IF conflict_id IS NOT NULL THEN
    RAISE EXCEPTION 'Doctor slot conflict: another appointment already occupies this time range.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_appointments_doctor_slot_overlap ON public.appointments;

CREATE TRIGGER trg_appointments_doctor_slot_overlap
  BEFORE INSERT OR UPDATE OF doctor_id, preferred_date, preferred_time, duration_minutes, status, branch_id
  ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_appointment_doctor_slot_overlap();
