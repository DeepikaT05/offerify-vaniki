
CREATE TABLE public.offer_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  letter_no TEXT NOT NULL,
  letter_date DATE NOT NULL DEFAULT CURRENT_DATE,
  role TEXT NOT NULL CHECK (role IN ('developer','sales','manager')),
  employee_name TEXT NOT NULL,
  village TEXT NOT NULL DEFAULT '',
  po TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  pin_code TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  post TEXT NOT NULL DEFAULT '',
  salary TEXT NOT NULL DEFAULT '',
  pf_included BOOLEAN NOT NULL DEFAULT false,
  annual_increment TEXT NOT NULL DEFAULT '5%',
  hq TEXT NOT NULL DEFAULT '',
  contract_period TEXT NOT NULL DEFAULT '1 year',
  casual_leaves INTEGER NOT NULL DEFAULT 10,
  medical_leaves INTEGER NOT NULL DEFAULT 15,
  sales_target TEXT,
  incentive_rules TEXT NOT NULL DEFAULT '',
  notice_period TEXT NOT NULL DEFAULT '1 month',
  joining_deadline TEXT NOT NULL DEFAULT '15.07.2026',
  jurisdiction TEXT NOT NULL DEFAULT 'DURG',
  custom_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.offer_letters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offer_letters TO authenticated;
GRANT ALL ON public.offer_letters TO service_role;

ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON public.offer_letters FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.offer_letters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.offer_letters FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON public.offer_letters FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_offer_letters_updated_at
BEFORE UPDATE ON public.offer_letters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
