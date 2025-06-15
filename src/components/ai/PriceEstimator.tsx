
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calculator, MapPin, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PriceEstimationProps {
  origin?: string;
  destination?: string;
  weight?: number;
  onPriceEstimated?: (price: number) => void;
}

export const PriceEstimator = ({ 
  origin = '', 
  destination = '', 
  weight = 0,
  onPriceEstimated 
}: PriceEstimationProps) => {
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    origin: origin,
    destination: destination,
    weight: weight || 1,
    urgency: 'normal' as 'low' | 'normal' | 'high'
  });
  const { toast } = useToast();

  const handleEstimate = async () => {
    if (!formData.origin || !formData.destination) {
      toast({
        title: "Missing Information",
        description: "Please provide both origin and destination",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Requesting price estimation for:', formData);
      
      const { data, error } = await supabase.functions.invoke('estimate-price', {
        body: {
          origin: formData.origin,
          destination: formData.destination,
          weight: formData.weight,
          urgency: formData.urgency
        }
      });

      if (error) throw error;

      const price = data?.estimatedPrice || 0;
      setEstimatedPrice(price);
      onPriceEstimated?.(price);

      toast({
        title: "Price Estimated",
        description: `Estimated delivery cost: $${price}`,
      });
    } catch (error) {
      console.error('Price estimation error:', error);
      toast({
        title: "Estimation Error",
        description: "Failed to estimate price. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          AI Price Estimation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">
              <MapPin className="h-4 w-4 inline mr-1" />
              Origin
            </Label>
            <Input
              id="origin"
              placeholder="City, Country"
              value={formData.origin}
              onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">
              <MapPin className="h-4 w-4 inline mr-1" />
              Destination
            </Label>
            <Input
              id="destination"
              placeholder="City, Country"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">
              <Package className="h-4 w-4 inline mr-1" />
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              min="0.1"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <select
              id="urgency"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.urgency}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                urgency: e.target.value as 'low' | 'normal' | 'high' 
              }))}
            >
              <option value="low">Low (Flexible timing)</option>
              <option value="normal">Normal</option>
              <option value="high">High (Urgent)</option>
            </select>
          </div>
        </div>

        <Button 
          onClick={handleEstimate} 
          disabled={loading || !formData.origin || !formData.destination}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Estimate Price
            </>
          )}
        </Button>

        {estimatedPrice !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${estimatedPrice}
              </div>
              <div className="text-sm text-gray-600">
                Estimated delivery cost
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Based on distance, weight, urgency, and historical data
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
