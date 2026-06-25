-- Owner revenue ledger: expense categories + expenses (MVP)

CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL DEFAULT (timezone('utc'::text, now()))::date,
    source VARCHAR(50) NOT NULL DEFAULT 'manual',
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_org_branch_date
    ON public.expenses (organization_id, branch_id, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expense_categories_org
    ON public.expense_categories (organization_id, sort_order);

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_expense_category ON public.expense_categories
    FOR SELECT USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY manage_expense_category ON public.expense_categories
    FOR ALL USING (public.has_org_role(organization_id, ARRAY['clinic_admin']));

CREATE POLICY select_expense ON public.expenses
    FOR SELECT USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY manage_expense ON public.expenses
    FOR ALL USING (public.has_org_role(organization_id, ARRAY['clinic_admin']));

-- Seed default categories for existing organizations
INSERT INTO public.expense_categories (organization_id, name, is_system, sort_order)
SELECT o.id, seed.name, true, seed.sort_order
FROM public.organizations o
CROSS JOIN (
    VALUES
        ('Clinic bills', 1),
        ('Staff pay', 2),
        ('Restock', 3),
        ('Other', 99)
) AS seed(name, sort_order)
ON CONFLICT (organization_id, name) DO NOTHING;
