
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Luggage, Send, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'traveler' | 'sender'>('sender');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const handleRoleSelection = () => {
    setStep(2);
  };

  const handleProfileCompletion = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role,
          phone,
          address,
          onboarding_completed: true
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Welcome to CarryConnect!",
        description: "Your profile has been set up successfully.",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Luggage className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to CarryConnect!</CardTitle>
            <p className="text-gray-600">Let's set up your account. What would you like to do?</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <RadioGroup value={role} onValueChange={(value: 'traveler' | 'sender') => setRole(value)}>
              <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:bg-blue-50 transition-colors">
                <RadioGroupItem value="traveler" id="traveler-onboard" />
                <Label htmlFor="traveler-onboard" className="flex items-center cursor-pointer flex-1">
                  <Luggage className="h-5 w-5 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium">Offer luggage space</div>
                    <div className="text-sm text-gray-500">I'm traveling and have extra space to carry items</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:bg-green-50 transition-colors">
                <RadioGroupItem value="sender" id="sender-onboard" />
                <Label htmlFor="sender-onboard" className="flex items-center cursor-pointer flex-1">
                  <Send className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Send items</div>
                    <div className="text-sm text-gray-500">I need to send items with travelers</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            <Button onClick={handleRoleSelection} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Check className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <p className="text-gray-600">Add some basic information to get started</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="onboard-name">Full Name</Label>
            <Input
              id="onboard-name"
              value={profile?.full_name || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">This was set from your signup</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="onboard-phone">Phone Number</Label>
            <Input
              id="onboard-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="onboard-address">Address</Label>
            <Input
              id="onboard-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-1">
              {role === 'traveler' ? 'As a Traveler:' : 'As a Sender:'}
            </h4>
            <p className="text-sm text-blue-700">
              {role === 'traveler' 
                ? 'You can create travel listings with available luggage space and earn money by carrying items for others.'
                : 'You can browse travelers going to your destination and request them to carry your items for a fee.'
              }
            </p>
          </div>
          
          <Button onClick={handleProfileCompletion} className="w-full" disabled={loading || !phone || !address}>
            {loading ? 'Setting up...' : 'Complete Setup'}
          </Button>
          
          <Button variant="outline" onClick={() => setStep(1)} className="w-full">
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
