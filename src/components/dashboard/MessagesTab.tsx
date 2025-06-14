
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock } from 'lucide-react';

export const MessagesTab = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchMatches();
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
            full_name,
            avatar_url
          ),
          sender:profiles!matches_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .or(`traveler_id.eq.${profile.id},sender_id.eq.${profile.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
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
            const otherUser = match.traveler_id === profile?.id ? match.sender : match.traveler;
            const isFromMe = match.sender_id === profile?.id;
            
            return (
              <Card key={match.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                        <Badge 
                          variant={match.status === 'pending' ? 'secondary' : 'default'}
                          className="ml-2"
                        >
                          {match.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {match.listings?.title}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(match.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
