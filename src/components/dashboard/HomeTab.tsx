
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Star } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string;
  origin: string;
  destination: string;
  price_usd: number;
  travel_date: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    rating: number;
    total_ratings: number;
  } | null;
}

export const HomeTab = () => {
  const { profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role) {
      fetchListings();
    } else {
      setLoading(false);
    }
  }, [profile?.role]);

  const fetchListings = async () => {
    if (!profile) return;
    setLoading(true);
    const listingType = profile.role === 'sender' ? 'space_available' : 'delivery_request';
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          origin,
          destination,
          price_usd,
          travel_date,
          profiles (
            full_name,
            avatar_url,
            rating,
            total_ratings
          )
        `)
        .eq('type', listingType)
        .eq('is_active', true)
        .neq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setListings(data as Listing[] || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (!profile) return "Welcome to CarryConnect";
    return profile.role === 'traveler' 
      ? 'Recent Delivery Requests' 
      : 'Available Travelers';
  };

  const getSubtitle = () => {
    if (!profile) return "Your dashboard content will appear here.";
    return profile.role === 'traveler'
      ? 'People looking for travelers to carry their items'
      : 'Travelers with available luggage space';
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">{getTitle()}</h2>
        <p className="text-gray-600 text-sm">{getSubtitle()}</p>
      </div>
      
      {listings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No listings found right now.</p>
          <p className="text-sm mt-1">Check back later or create your own listing!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>{listing.profiles?.full_name.charAt(0) ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <span>{listing.profiles?.full_name}</span>
                      {listing.profiles?.rating && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="ml-1">{listing.profiles.rating.toFixed(1)}</span>
                          <span className="ml-1">({listing.profiles.total_ratings})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 my-3">{listing.description}</p>
                
                <div className="flex items-center justify-between text-sm font-medium">
                  <div className="flex items-center">
                    <span>{listing.origin}</span>
                    <ArrowRight className="h-4 w-4 mx-2" />
                    <span>{listing.destination}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    ${listing.price_usd}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Travel Date: {new Date(listing.travel_date).toLocaleDateString()}
                </div>

                <Button className="w-full mt-4" size="sm">
                  View & Message
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
