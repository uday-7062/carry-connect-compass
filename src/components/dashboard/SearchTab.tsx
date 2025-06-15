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
import { DemoContent } from '@/components/onboarding/DemoContent';

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

  // For now, show demo content since we don't have real search results yet
  const showDemoContent = true; // This would be replaced with actual search results check

  if (showDemoContent && profile?.role) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">
            {profile.role === 'sender' ? 'Find Travelers' : 'Browse Requests'}
          </h2>
          <p className="text-gray-600 text-sm">
            {profile.role === 'sender' 
              ? 'Search for travelers going to your destination'
              : 'Find delivery requests that match your travel route'
            }
          </p>
        </div>
        
        <DemoContent userRole={profile.role as 'traveler' | 'sender'} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Search</h2>
      <p className="text-gray-600">Search functionality will appear here.</p>
    </div>
  );
};
