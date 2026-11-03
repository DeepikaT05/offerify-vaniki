-- Alter the role check constraint to include lifting_discount and dealer_scheme
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.offer_letters'::regclass 
          AND contype = 'c' 
          AND conname LIKE '%role%'
    LOOP
        EXECUTE 'ALTER TABLE public.offer_letters DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

ALTER TABLE public.offer_letters ADD CONSTRAINT offer_letters_role_check CHECK (role IN ('developer', 'sales', 'manager', 'hr', 'field_assistant', 'other', 'stockiest', 'lifting_discount', 'dealer_scheme'));
