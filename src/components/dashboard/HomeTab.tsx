
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Weight, DollarSign, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Listing = {
  id: string;
  title: string;
  description: string;
  origin: string;
  destination: string;
  travel_date: string;
  price_usd: number;
  weight_kg?: number;
  available_space_kg?: number;
  type: 'space_available' | 'delivery_request';
  user_id?: string;
  profiles?: {
    full_name: string;
    rating: number;
  };
};

export const HomeTab = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            full_name,
            rating
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMatch = async (listingId: string, travelerId: string, senderId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          listing_id: listingId,
          traveler_id: travelerId,
          sender_id: senderId,
          status: 'pending'
        });

      if (error) throw error;
      
      toast({
        title: "Match Created",
        description: "Your match request has been sent!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0]}!
        </h2>
        <p className="text-blue-100">
          {profile?.role === 'traveler' 
            ? 'Share your luggage space and earn money' 
            : 'Find travelers to deliver your items'
          }
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Listings</h3>
        <Button variant="outline" size="sm" onClick={fetchListings}>
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base line-clamp-2">
                  {listing.title}
                </CardTitle>
                <Badge variant={listing.type === 'space_available' ? 'default' : 'secondary'}>
                  {listing.type === 'space_available' ? 'Space' : 'Request'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{listing.origin} → {listing.destination}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(listing.travel_date).toLocaleDateString()}
                  </div>
                  
                  {(listing.weight_kg || listing.available_space_kg) && (
                    <div className="flex items-center text-gray-600">
                      <Weight className="h-4 w-4 mr-1" />
                      {listing.weight_kg || listing.available_space_kg}kg
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    <span className="font-semibold text-green-600">
                      ${listing.price_usd}
                    </span>
                  </div>
                  
                  {listing.profiles && (
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      <span>{listing.profiles.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-500">
                    by {listing.profiles?.full_name}
                  </span>
                  
                  <Button 
                    size="sm"
                    onClick={() => {
                      if (profile?.role === 'traveler' && listing.type === 'delivery_request' && listing.user_id) {
                        createMatch(listing.id, profile.id, listing.user_id);
                      } else if (profile?.role === 'sender' && listing.type === 'space_available' && listing.user_id) {
                        createMatch(listing.id, listing.user_id, profile.id);
                      }
                    }}
                    disabled={
                      (profile?.role === 'traveler' && listing.type === 'space_available') ||
                      (profile?.role === 'sender' && listing.type === 'delivery_request')
                    }
                  >
                    {profile?.role === 'traveler' ? 'Offer Space' : 'Request Delivery'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No listings available yet.</p>
          <p className="text-sm mt-1">Be the first to create one!</p>
        </div>
      )}
    </div>
  );
};
