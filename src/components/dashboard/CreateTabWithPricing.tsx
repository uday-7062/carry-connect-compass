import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CitySelector } from '@/components/ui/city-selector';
import { PriceEstimator } from '@/components/ai/PriceEstimator';
import { FlightTicketParser } from '@/components/ai/FlightTicketParser';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Package, FileText, Calculator, Plane } from 'lucide-react';

export const CreateTabWithPricing = () => {
  const [formData, setFormData] = useState({
    type: 'delivery_request' as 'delivery_request' | 'space_available',
    title: '',
    description: '',
    origin: '',
    destination: '',
    travel_date: '',
    weight_kg: '',
    dimensions: '',
    available_space_kg: '',
    price_usd: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPriceEstimator, setShowPriceEstimator] = useState(false);
  const [showTicketParser, setShowTicketParser] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleFlightDataExtracted = (data: {
    origin: string;
    destination: string;
    travel_date: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      origin: data.origin || prev.origin,
      destination: data.destination || prev.destination,
      travel_date: data.travel_date || prev.travel_date
    }));
    setShowTicketParser(false);
  };

  const handlePriceEstimated = (price: number) => {
    setFormData(prev => ({ ...prev, price_usd: price.toString() }));
    setShowPriceEstimator(false);
    toast({
      title: "Price Updated",
      description: `AI suggested price: $${price}`,
    });
  };

  const handleAIEstimate = () => {
    if (!formData.origin || !formData.destination) {
      toast({
        title: "Missing Information", 
        description: "Please enter origin and destination first",
        variant: "destructive"
      });
      return;
    }
    setShowPriceEstimator(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const listingData = {
        user_id: profile.id,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        origin: formData.origin,
        destination: formData.destination,
        travel_date: formData.travel_date,
        price_usd: parseFloat(formData.price_usd) || 0,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        dimensions: formData.dimensions || null,
        available_space_kg: formData.available_space_kg ? parseFloat(formData.available_space_kg) : null,
      };

      const { error } = await supabase
        .from('listings')
        .insert(listingData);

      if (error) throw error;

      toast({
        title: "Listing Created",
        description: "Your listing has been created successfully!",
      });

      // Reset form
      setFormData({
        type: 'delivery_request',
        title: '',
        description: '',
        origin: '',
        destination: '',
        travel_date: '',
        weight_kg: '',
        dimensions: '',
        available_space_kg: '',
        price_usd: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create Listing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTicketParser(!showTicketParser)}
                className="w-full mb-4"
              >
                <Plane className="h-4 w-4 mr-2" />
                {showTicketParser ? 'Hide' : 'Upload'} Flight Ticket
              </Button>
            </div>

            {showTicketParser && (
              <div className="mb-6">
                <FlightTicketParser onDataExtracted={handleFlightDataExtracted} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'delivery_request' }))}
                  className={`flex-1 p-3 rounded-lg border ${
                    formData.type === 'delivery_request' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <Package className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Send Package</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'space_available' }))}
                  className={`flex-1 p-3 rounded-lg border ${
                    formData.type === 'space_available' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="h-5 w-5 mx-auto mb-1 bg-blue-500 rounded"></div>
                  <div className="text-sm font-medium">Offer Space</div>
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of your listing"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CitySelector
                  id="origin"
                  label="Origin"
                  value={formData.origin}
                  onChange={(value) => setFormData(prev => ({ ...prev, origin: value }))}
                  placeholder="Search origin city..."
                  required
                />
                <CitySelector
                  id="destination"
                  label="Destination"
                  value={formData.destination}
                  onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                  placeholder="Search destination city..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="travel_date">
                    <CalendarDays className="h-4 w-4 inline mr-1" />
                    Travel Date
                  </Label>
                  <Input
                    id="travel_date"
                    type="date"
                    value={formData.travel_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, travel_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_usd">Price (USD)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="price_usd"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_usd}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_usd: e.target.value }))}
                      placeholder="Enter price"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAIEstimate}
                      className="whitespace-nowrap"
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      AI Estimate
                    </Button>
                  </div>
                </div>
              </div>

              {formData.type === 'delivery_request' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                      placeholder="L x W x H (cm)"
                    />
                  </div>
                </div>
              )}

              {formData.type === 'space_available' && (
                <div className="space-y-2">
                  <Label htmlFor="available_space_kg">Available Space (kg)</Label>
                  <Input
                    id="available_space_kg"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.available_space_kg}
                    onChange={(e) => setFormData(prev => ({ ...prev, available_space_kg: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about your listing"
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Listing'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {showPriceEstimator ? (
          <PriceEstimator
            origin={formData.origin}
            destination={formData.destination}
            weight={parseFloat(formData.weight_kg) || 1}
            onPriceEstimated={handlePriceEstimated}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Need Help with Pricing?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Our AI can help estimate a fair price based on distance, weight, and market rates.
              </p>
              <Button 
                onClick={handleAIEstimate}
                className="w-full"
                variant="outline"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Get AI Price Estimate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
