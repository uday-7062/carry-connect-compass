
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface ChatMessageImageProps {
  fileUrl: string;
}

export const ChatMessageImage = ({ fileUrl }: ChatMessageImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSignedUrl = async () => {
      setLoading(true);
      try {
        // Create a signed URL with 1-hour expiration
        const { data, error } = await supabase.storage
          .from('chat_attachments')
          .createSignedUrl(fileUrl, 3600);
        
        if (error) throw error;
        setImageUrl(data.signedUrl);
      } catch (error) {
        console.error('Error getting signed URL for image:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fileUrl) {
      getSignedUrl();
    }
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 w-40 bg-gray-200 rounded-md">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-24 w-40 bg-gray-200 rounded-md">
        <ImageIcon className="h-6 w-6 text-gray-500" />
      </div>
    );
  }

  return (
    <a href={imageUrl} target="_blank" rel="noopener noreferrer">
      <img 
        src={imageUrl} 
        alt="chat attachment" 
        className="max-w-xs max-h-48 rounded-md cursor-pointer" 
      />
    </a>
  );
};
