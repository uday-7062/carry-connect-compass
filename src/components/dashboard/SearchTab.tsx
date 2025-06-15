
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SearchFilters, SearchFilters as SearchFiltersType } from '@/components/search/SearchFilters';
import { TrustBadges } from '@/components/TrustBadges';
import { PaymentButton } from '@/components/PaymentButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Package, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SearchTab = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const { profile } = useAuth();
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
    <div className="p-4 space-y-4">
      <SearchFilters 
        onFiltersChange={setFilters}
        initialFilters={filters}
      />
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No listings found matching your criteria.</p>
              <p className="text-sm mt-1">Try adjusting your filters or check back later!</p>
            </div>
          ) : (
            listings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {listing.profiles?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{listing.title}</CardTitle>
                        <p className="text-sm text-gray-600">{listing.profiles?.full_name}</p>
                        <TrustBadges profile={listing.profiles} size="sm" />
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {listing.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{listing.origin} → {listing.destination}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(listing.travel_date).toLocaleDateString()}</span>
                    </div>
                    {listing.weight_kg && (
                      <div className="flex items-center text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        <span>{listing.weight_kg}kg</span>
                      </div>
                    )}
                    <div className="flex items-center text-green-600 font-semibold">
                      <span>${listing.price_usd}</span>
                    </div>
                  </div>
                  
                  {listing.description && (
                    <p className="text-sm text-gray-600">{listing.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleMatch(listing.id)}
                      className="flex-1"
                      size="sm"
                    >
                      Send Match Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
