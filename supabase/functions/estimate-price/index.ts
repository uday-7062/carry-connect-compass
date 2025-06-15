
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Coordinates for major cities (simplified dataset)
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  'bangkok': { lat: 13.7563, lng: 100.5018 },
  'seoul': { lat: 37.5665, lng: 126.9780 },
  'amsterdam': { lat: 52.3676, lng: 4.9041 }
};

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getCityCoordinates(cityName: string) {
  const normalized = cityName.toLowerCase().trim();
  
  // Direct match
  if (cityCoordinates[normalized]) {
    return cityCoordinates[normalized];
  }
  
  // Partial match
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return coords;
    }
  }
  
  return null;
}

async function getHistoricalPricing(supabase: any, origin: string, destination: string) {
  try {
    const { data } = await supabase
      .from('listings')
      .select('price_usd')
      .ilike('origin', `%${origin}%`)
      .ilike('destination', `%${destination}%`)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data && data.length > 0) {
      const prices = data.map((listing: any) => listing.price_usd);
      return prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
    }
  } catch (error) {
    console.log('No historical data found:', error);
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { origin, destination, weight, urgency } = await req.json();
    console.log('Estimating price for:', { origin, destination, weight, urgency });

    // Get coordinates for origin and destination
    const originCoords = getCityCoordinates(origin);
    const destCoords = getCityCoordinates(destination);

    if (!originCoords || !destCoords) {
      // Fallback pricing for unknown cities
      const estimatedPrice = Math.max(25, Math.round(weight * 8 + Math.random() * 20));
      return new Response(JSON.stringify({ estimatedPrice }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate distance
    const distance = calculateDistance(
      originCoords.lat, originCoords.lng,
      destCoords.lat, destCoords.lng
    );

    // Base pricing model
    let baseRate = 0.15; // Base rate per km
    
    // Distance modifiers
    if (distance > 10000) baseRate *= 0.8; // Long distance discount
    else if (distance < 500) baseRate *= 1.5; // Short distance premium
    
    // Weight modifiers
    const weightMultiplier = Math.max(1, weight * 0.3);
    
    // Urgency modifiers
    const urgencyMultipliers = {
      'low': 0.8,
      'normal': 1.0,
      'high': 1.4
    };
    
    // Calculate base price
    let estimatedPrice = distance * baseRate * weightMultiplier * urgencyMultipliers[urgency as keyof typeof urgencyMultipliers];
    
    // Get historical pricing data
    const historicalAvg = await getHistoricalPricing(supabaseClient, origin, destination);
    if (historicalAvg) {
      // Blend calculated price with historical average (70% calculated, 30% historical)
      estimatedPrice = estimatedPrice * 0.7 + historicalAvg * 0.3;
    }
    
    // Add city pair premium for popular routes
    const popularRoutes = [
      ['new york', 'london'], ['london', 'paris'], ['tokyo', 'singapore'],
      ['dubai', 'mumbai'], ['sydney', 'singapore'], ['los angeles', 'tokyo']
    ];
    
    const normalizedOrigin = origin.toLowerCase();
    const normalizedDest = destination.toLowerCase();
    
    const isPopularRoute = popularRoutes.some(([city1, city2]) =>
      (normalizedOrigin.includes(city1) && normalizedDest.includes(city2)) ||
      (normalizedOrigin.includes(city2) && normalizedDest.includes(city1))
    );
    
    if (isPopularRoute) {
      estimatedPrice *= 1.2; // 20% premium for popular routes
    }
    
    // Apply minimum price and round
    estimatedPrice = Math.max(5, Math.round(estimatedPrice));
    
    console.log('Price calculation:', {
      distance: Math.round(distance),
      basePrice: Math.round(distance * baseRate),
      withWeight: Math.round(distance * baseRate * weightMultiplier),
      withUrgency: Math.round(distance * baseRate * weightMultiplier * urgencyMultipliers[urgency as keyof typeof urgencyMultipliers]),
      historicalAvg,
      finalPrice: estimatedPrice
    });

    return new Response(JSON.stringify({ 
      estimatedPrice,
      details: {
        distance: Math.round(distance),
        weightFactor: weightMultiplier,
        urgencyFactor: urgencyMultipliers[urgency as keyof typeof urgencyMultipliers],
        isPopularRoute,
        historicalInfluence: historicalAvg ? true : false
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Price estimation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
