
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, Weight, DollarSign, Search } from 'lucide-react';

export const SearchTab = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const searchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            full_name,
            rating
          )
        `)
        .eq('is_active', true);

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      if (searchQuery) {
        query = query.or(`origin.ilike.%${searchQuery}%,destination.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchListings();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by city, route, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Listings</SelectItem>
              <SelectItem value="space_available">Space Available</SelectItem>
              <SelectItem value="delivery_request">Delivery Requests</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={searchListings} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
                <Badge variant={listing.type === 'space_available' ? 'default' : 'secondary'}>
                  {listing.type === 'space_available' ? 'Space' : 'Request'}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {listing.origin} → {listing.destination}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(listing.travel_date).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${listing.price_usd}
                  </div>
                </div>
                
                {listing.description && (
                  <p className="text-gray-600 text-xs line-clamp-2 mt-2">
                    {listing.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>No listings found.</p>
          <p className="text-sm mt-1">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};
