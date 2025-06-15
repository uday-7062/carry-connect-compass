
-- Create payments table to track all transactions
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  traveler_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_usd NUMERIC NOT NULL,
  platform_fee_usd NUMERIC NOT NULL,
  traveler_amount_usd NUMERIC NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'released', 'refunded', 'disputed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create delivery_confirmations table to track delivery status
CREATE TABLE public.delivery_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  confirmed_by_traveler BOOLEAN DEFAULT FALSE,
  confirmed_by_sender BOOLEAN DEFAULT FALSE,
  traveler_confirmed_at TIMESTAMPTZ,
  sender_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (
    sender_id = auth.uid() OR traveler_id = auth.uid()
  );

CREATE POLICY "Insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Update payments" ON public.payments
  FOR UPDATE USING (true);

-- Add RLS policies for delivery confirmations
ALTER TABLE public.delivery_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their delivery confirmations" ON public.delivery_confirmations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.id = payment_id 
      AND (p.sender_id = auth.uid() OR p.traveler_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their delivery confirmations" ON public.delivery_confirmations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.id = payment_id 
      AND (p.sender_id = auth.uid() OR p.traveler_id = auth.uid())
    )
  );

CREATE POLICY "Insert delivery confirmations" ON public.delivery_confirmations
  FOR INSERT WITH CHECK (true);
