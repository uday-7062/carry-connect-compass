
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Luggage, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CreateTab = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'space_available' as 'space_available' | 'delivery_request',
    title: '',
    description: '',
    origin: '',
    destination: '',
    travel_date: '',
    weight_kg: '',
    available_space_kg: '',
    price_usd: '',
    dimensions: ''
  });
  
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    try {
      const listingData = {
        user_id: profile.id,
        type: formData.type,
        title: formData.title,
        description: formData.description || null,
        origin: formData.origin,
        destination: formData.destination,
        travel_date: formData.travel_date,
        price_usd: parseFloat(formData.price_usd),
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        available_space_kg: formData.available_space_kg ? parseFloat(formData.available_space_kg) : null,
        dimensions: formData.dimensions || null,
        is_active: true
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
        type: 'space_available',
        title: '',
        description: '',
        origin: '',
        destination: '',
        travel_date: '',
        weight_kg: '',
        available_space_kg: '',
        price_usd: '',
        dimensions: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Listing</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Listing Type</Label>
              <RadioGroup 
                value={formData.type} 
                onValueChange={(value: 'space_available' | 'delivery_request') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="space_available" id="space" />
                  <Label htmlFor="space" className="flex items-center cursor-pointer flex-1">
                    <Luggage className="h-4 w-4 mr-2 text-blue-600" />
                    <div>
                      <div className="font-medium">I have space available</div>
                      <div className="text-sm text-gray-500">Offer luggage space while traveling</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="delivery_request" id="request" />
                  <Label htmlFor="request" className="flex items-center cursor-pointer flex-1">
                    <Send className="h-4 w-4 mr-2 text-green-600" />
                    <div>
                      <div className="font-medium">I need delivery</div>
                      <div className="text-sm text-gray-500">Request item delivery via travelers</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title for your listing"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="origin">From</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="Origin city"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">To</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Destination city"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel_date">Travel Date</Label>
              <Input
                id="travel_date"
                type="date"
                value={formData.travel_date}
                onChange={(e) => setFormData(prev => ({ ...prev, travel_date: e.target.value }))}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="weight">
                  {formData.type === 'space_available' ? 'Available Space (kg)' : 'Weight (kg)'}
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.type === 'space_available' ? formData.available_space_kg : formData.weight_kg}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [formData.type === 'space_available' ? 'available_space_kg' : 'weight_kg']: e.target.value 
                  }))}
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price_usd}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_usd: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {formData.type === 'delivery_request' && (
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (optional)</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="e.g., 30x20x10 cm"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about your listing..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
