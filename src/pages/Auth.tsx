
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Luggage, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TermsModal } from '@/components/legal/TermsModal';
import { PrivacyModal } from '@/components/legal/PrivacyModal';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'traveler' | 'sender'>('sender');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the Terms & Conditions and Privacy Policy to continue.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Luggage className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            CarryConnect
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Welcome back!' : 'Join the global luggage network'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="space-y-3">
                <Label>I want to:</Label>
                <RadioGroup value={role} onValueChange={(value: 'traveler' | 'sender') => setRole(value)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="traveler" id="traveler" />
                    <Label htmlFor="traveler" className="flex items-center cursor-pointer flex-1">
                      <Luggage className="h-4 w-4 mr-2 text-blue-600" />
                      <div>
                        <div className="font-medium">Offer space</div>
                        <div className="text-sm text-gray-500">I'm traveling and have extra luggage space</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="sender" id="sender" />
                    <Label htmlFor="sender" className="flex items-center cursor-pointer flex-1">
                      <Send className="h-4 w-4 mr-2 text-green-600" />
                      <div>
                        <div className="font-medium">Send items</div>
                        <div className="text-sm text-gray-500">I need to send items with travelers</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the <TermsModal triggerText="Terms & Conditions" /> and <PrivacyModal triggerText="Privacy Policy" />
                  </Label>
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading || (!isLogin && !acceptedTerms)}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 pt-4 border-t text-center space-x-4">
              <TermsModal />
              <PrivacyModal />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
