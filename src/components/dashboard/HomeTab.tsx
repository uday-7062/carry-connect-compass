
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TrustBadges } from '@/components/TrustBadges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MapPin, Calendar, Package, Star, Bell, TrendingUp } from 'lucide-react';

export const HomeTab = () => {
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedDeliveries: 0,
    activeListings: 0,
    trustScore: 0
  });
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      // Fetch recent listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select(`
          *,
          profiles (
            full_name,
            rating,
            total_ratings,
            email_verified,
            id_verified
          )
        `)
        .neq('user_id', profile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          *,
          listings (
            title,
            origin,
            destination,
            price_usd
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
        .order('created_at', { ascending: false })
        .limit(3);

      // Calculate stats
      const { data: userListings } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', profile.id)
        .eq('is_active', true);

      const { data: completedMatches } = await supabase
        .from('matches')
        .select('id')
        .or(`traveler_id.eq.${profile.id},sender_id.eq.${profile.id}`)
        .eq('status', 'completed');

      const { data: earnings } = await supabase
        .from('payments')
        .select('traveler_amount_usd')
        .eq('traveler_id', profile.id)
        .eq('status', 'released');

      const totalEarnings = earnings?.reduce((sum, payment) => sum + Number(payment.traveler_amount_usd), 0) || 0;
      const trustScore = calculateTrustScore(profile);

      setRecentListings(listingsData || []);
      setRecentMatches(matchesData || []);
      setStats({
        totalEarnings,
        completedDeliveries: completedMatches?.length || 0,
        activeListings: userListings?.length || 0,
        trustScore
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrustScore = (profile: any) => {
    let score = 0;
    if (profile.email_verified) score += 25;
    if (profile.id_verified === 'verified') score += 35;
    if (profile.rating && profile.rating >= 4) score += 25;
    if (profile.total_ratings && profile.total_ratings >= 5) score += 15;
    return Math.min(score, 100);
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
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">
                Welcome back, {profile?.full_name}!
              </h2>
              <p className="opacity-90">
                Ready to {profile?.role === 'traveler' ? 'help deliver packages' : 'send your items'}?
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.trustScore}%</div>
              <div className="text-sm opacity-90">Trust Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Your Trust Profile</h3>
            <Button variant="outline" size="sm">
              Improve Score
            </Button>
          </div>
          <TrustBadges profile={profile} size="md" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-xl font-bold text-green-600">${stats.totalEarnings}</div>
            <div className="text-xs text-gray-600">Total Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-xl font-bold">{stats.completedDeliveries}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Plus className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-xl font-bold">{stats.activeListings}</div>
            <div className="text-xs text-gray-600">Active Listings</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-xl font-bold">{profile?.rating?.toFixed(1) || '0.0'}</div>
            <div className="text-xs text-gray-600">Your Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Matches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentMatches.map((match) => {
                const otherUser = match.traveler_id === profile?.id ? match.sender : match.traveler;
                return (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {otherUser?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{match.listings?.title}</p>
                        <p className="text-xs text-gray-600">
                          {match.listings?.origin} → {match.listings?.destination}
                        </p>
                      </div>
                    </div>
                    <Badge variant={match.status === 'pending' ? 'secondary' : 'default'}>
                      {match.status}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentListings.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No recent listings available
              </p>
            ) : (
              recentListings.map((listing) => (
                <div key={listing.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{listing.title}</h4>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {listing.origin} → {listing.destination}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">${listing.price_usd}</div>
                      <TrustBadges profile={listing.profiles} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(listing.travel_date).toLocaleDateString()}
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
