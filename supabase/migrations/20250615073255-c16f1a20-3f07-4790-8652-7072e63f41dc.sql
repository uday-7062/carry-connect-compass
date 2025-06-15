
-- Add columns to messages table for file attachments
ALTER TABLE public.messages
ADD COLUMN message_type TEXT NOT NULL DEFAULT 'text',
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT;

-- Create storage bucket for chat attachments with size and type limits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat_attachments', 'chat_attachments', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']);

-- RLS policy for uploading chat attachments
-- The file path is expected to be: {match_id}/{file_name_with_uuid}
CREATE POLICY "Users can upload chat attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat_attachments' AND
  EXISTS (
    SELECT 1 FROM matches
    WHERE id = ((storage.foldername(name))[1])::uuid
    AND (traveler_id = auth.uid() OR sender_id = auth.uid())
  )
);

-- RLS policy for viewing chat attachments
CREATE POLICY "Users can view chat attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat_attachments' AND
  EXISTS (
    SELECT 1 FROM matches
    WHERE id = ((storage.foldername(name))[1])::uuid
    AND (traveler_id = auth.uid() OR sender_id = auth.uid())
  )
);
