
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SearchFilters, SearchFilters as SearchFiltersType } from '@/components/search/SearchFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Package, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SearchTab = () => {
  const { profile } = useAuth();
  
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles (
            id,
            full_name,
            rating,
            total_ratings,
            email_verified,
            id_verified,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .neq('user_id', profile?.id || '');

      // Apply filters
      if (filters.origin) {
        query = query.ilike('origin', `%${filters.origin}%`);
      }
      if (filters.destination) {
        query = query.ilike('destination', `%${filters.destination}%`);
      }
      if (filters.minPrice) {
        query = query.gte('price_usd', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price_usd', filters.maxPrice);
      }
      if (filters.startDate) {
        query = query.gte('travel_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('travel_date', filters.endDate);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'cheapest':
          query = query.order('price_usd', { ascending: true });
          break;
        case 'rating':
          query = query.order('profiles(rating)', { ascending: false });
          break;
        case 'earliest':
        default:
          query = query.order('travel_date', { ascending: true });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      let filteredData = data || [];

      // Apply verified filter (client-side since it's a join condition)
      if (filters.verifiedOnly) {
        filteredData = filteredData.filter(listing => 
          listing.profiles?.email_verified && listing.profiles?.id_verified === 'verified'
        );
      }

      setListings(filteredData);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (listingId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          listing_id: listingId,
          traveler_id: profile.role === 'traveler' ? profile.id : null,
          sender_id: profile.role === 'sender' ? profile.id : null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Match Request Sent",
        description: "Your match request has been sent to the user",
      });
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to send match request",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">
          {profile?.role === 'sender' ? 'Find Travelers' : 'Browse Requests'}
        </h2>
        <p className="text-gray-600 text-sm">
          {profile?.role === 'sender' 
            ? 'Search for travelers going to your destination'
            : 'Find delivery requests that match your travel route'
          }
        </p>
      </div>
      
      <SearchFilters onFiltersChange={setFilters} initialFilters={filters} />
      
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500">
              {profile?.role === 'sender' 
                ? 'No travelers match your search criteria'
                : 'No delivery requests match your search criteria'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {listing.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{listing.profiles?.full_name}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          {listing.profiles?.rating || 0}
                          {listing.profiles?.email_verified && (
                            <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ${listing.price_usd}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <h5 className="font-medium mb-1">{listing.title}</h5>
                    <p className="text-sm text-gray-600">{listing.description}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{listing.origin} → {listing.destination}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{new Date(listing.travel_date).toLocaleDateString()}</span>
                    </div>
                    {listing.weight_kg && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <span>Weight: {listing.weight_kg}kg</span>
                      </div>
                    )}
                    {listing.available_space_kg && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <span>Available space: {listing.available_space_kg}kg</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleMatch(listing.id)}
                  >
                    {profile?.role === 'sender' ? 'Request Delivery' : 'Accept Request'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
