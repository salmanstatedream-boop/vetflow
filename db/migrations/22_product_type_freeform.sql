-- Allow arbitrary product type strings (invoice intake creatable types)

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_type_check;
