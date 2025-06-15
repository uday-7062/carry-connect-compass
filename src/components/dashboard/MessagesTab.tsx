import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Match {
  id: string;
  status: string;
  created_at: string;
  listings: {
    id: string;
    price_usd: number;
    title: string;
    origin: string;
    destination: string;
  };
  traveler: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

export const MessagesTab = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { profile } = useAuth();

  if (selectedMatch) {
    if (!selectedMatch.traveler || !selectedMatch.sender) {
      setSelectedMatch(null);
      return null;
    }

    const otherUser = selectedMatch.traveler.id === profile?.id 
      ? selectedMatch.sender 
      : selectedMatch.traveler;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center p-4 border-b">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedMatch(null)}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold">Chat with {otherUser.full_name}</h2>
        </div>
        <div className="flex-1">
          <ChatWindow
            matchId={selectedMatch.id}
            otherUser={otherUser}
            onClose={() => setSelectedMatch(null)}
            listing={selectedMatch.listings}
            senderId={selectedMatch.sender.id}
            matchStatus={selectedMatch.status}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ChatList onSelectMatch={setSelectedMatch} />
    </div>
  );
};
