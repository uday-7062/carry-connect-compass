
-- Create user_reports table for reporting functionality
CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create verification_requests table for ID verification
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for user_reports
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports they made or about them" ON public.user_reports
  FOR SELECT USING (
    reporter_id = auth.uid() OR reported_user_id = auth.uid()
  );

CREATE POLICY "Users can create reports" ON public.user_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can update reports" ON public.user_reports
  FOR UPDATE USING (true);

-- Add RLS policies for verification_requests
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification requests" ON public.verification_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own verification requests" ON public.verification_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update verification requests" ON public.verification_requests
  FOR UPDATE USING (true);
