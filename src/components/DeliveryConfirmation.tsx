
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';

interface DeliveryConfirmationProps {
  payment: {
    id: string;
    amount_usd: number;
    platform_fee_usd: number;
    traveler_amount_usd: number;
    status: string;
    sender_id: string;
    traveler_id: string;
    listings: {
      title: string;
      origin: string;
      destination: string;
    };
    delivery_confirmations?: {
      confirmed_by_sender: boolean;
      confirmed_by_traveler: boolean;
      sender_confirmed_at: string | null;
      traveler_confirmed_at: string | null;
    }[];
  };
}

export const DeliveryConfirmation = ({ payment }: DeliveryConfirmationProps) => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const confirmation = payment.delivery_confirmations?.[0];
  const userType = profile?.id === payment.sender_id ? 'sender' : 'traveler';
  const hasUserConfirmed = userType === 'sender' 
    ? confirmation?.confirmed_by_sender 
    : confirmation?.confirmed_by_traveler;
  
  const bothConfirmed = confirmation?.confirmed_by_sender && confirmation?.confirmed_by_traveler;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('confirm-delivery', {
        body: { 
          paymentId: payment.id,
          userType 
        }
      });

      if (error) throw error;

      toast({
        title: "Delivery Confirmed",
        description: data?.bothConfirmed 
          ? "Payment has been released to the traveler!" 
          : "Waiting for the other party to confirm",
        variant: data?.bothConfirmed ? "default" : "default"
      });

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Confirmation error:', error);
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (bothConfirmed) {
      return <Badge className="bg-green-600">Completed</Badge>;
    }
    if (hasUserConfirmed) {
      return <Badge variant="secondary">Waiting for Other Party</Badge>;
    }
    return <Badge variant="outline">Pending Confirmation</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{payment.listings.title}</CardTitle>
            <p className="text-sm text-gray-600">
              {payment.listings.origin} → {payment.listings.destination}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Paid:</span>
            <span className="font-semibold">${payment.amount_usd}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Platform Fee:</span>
            <span>${payment.platform_fee_usd}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Traveler Receives:</span>
            <span className="font-semibold text-green-600">${payment.traveler_amount_usd}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm">
            {confirmation?.confirmed_by_sender ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            ) : (
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <span>Sender Confirmation</span>
            {confirmation?.confirmed_by_sender && (
              <span className="ml-auto text-xs text-gray-500">
                {new Date(confirmation.sender_confirmed_at!).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm">
            {confirmation?.confirmed_by_traveler ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            ) : (
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <span>Traveler Confirmation</span>
            {confirmation?.confirmed_by_traveler && (
              <span className="ml-auto text-xs text-gray-500">
                {new Date(confirmation.traveler_confirmed_at!).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {!hasUserConfirmed && payment.status === 'held' && (
          <Button 
            onClick={handleConfirm} 
            disabled={loading}
            className="w-full"
            size="sm"
          >
            {loading ? 'Confirming...' : 'Confirm Delivery'}
          </Button>
        )}

        {bothConfirmed && (
          <div className="text-center text-sm text-green-600 font-medium">
            ✅ Delivery completed and payment released!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
