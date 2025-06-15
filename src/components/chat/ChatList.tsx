
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock } from 'lucide-react';

interface Match {
  id: string;
  status: string;
  created_at: string;
  listings: {
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
  unread_count?: number;
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface ChatListProps {
  onSelectMatch?: (match: Match) => void;
}

export const ChatList = ({ onSelectMatch }: ChatListProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchMatches();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('matches-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          () => {
            fetchMatches(); // Refresh matches when new messages arrive
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const fetchMatches = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          listings (
            title,
            origin,
            destination
          ),
          traveler:profiles!matches_traveler_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          sender:profiles!matches_sender_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .or(`traveler_id.eq.${profile.id},sender_id.eq.${profile.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Filter out matches with null traveler or sender to prevent errors
      const validMatches = (data || []).filter(match => 
        match.traveler && match.sender
      );

      // Fetch unread message counts and last messages for each match
      const matchesWithMessages = await Promise.all(
        validMatches.map(async (match) => {
          const { data: unreadMessages } = await supabase
            .from('messages')
            .select('id')
            .eq('match_id', match.id)
            .eq('is_read', false)
            .neq('sender_id', profile.id);

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...match,
            unread_count: unreadMessages?.length || 0,
            last_message: lastMessage
          };
        })
      );

      setMatches(matchesWithMessages);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Messages</h2>
      
      {matches.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500">
            Your conversations will appear here when you start matching with others.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            // Add null checks before accessing properties
            if (!match.traveler || !match.sender) {
              console.error('Invalid match data for match:', match.id);
              return null;
            }

            const otherUser = match.traveler.id === profile?.id ? match.sender : match.traveler;
            
            return (
              <Card 
                key={match.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectMatch?.(match)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {otherUser?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {otherUser?.full_name}
                        </p>
                        <div className="flex items-center space-x-2">
                          {match.unread_count > 0 && (
                            <Badge className="bg-blue-600 text-white">
                              {match.unread_count}
                            </Badge>
                          )}
                          <Badge 
                            variant={match.status === 'pending' ? 'secondary' : 'default'}
                          >
                            {match.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {match.listings?.title}
                      </p>
                      
                      {match.last_message && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {match.last_message.content}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {match.last_message 
                          ? new Date(match.last_message.created_at).toLocaleDateString()
                          : new Date(match.created_at).toLocaleDateString()
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }).filter(Boolean)}
        </div>
      )}
    </div>
  );
};
