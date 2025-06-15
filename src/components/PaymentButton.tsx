
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  listingId: string;
  matchId: string;
  amount: number;
  disabled?: boolean;
}

export const PaymentButton = ({ listingId, matchId, amount, disabled }: PaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (amount < 5) {
      toast({
        title: "Minimum Payment",
        description: "Minimum payment amount is $5",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating payment for listing:', listingId, 'match:', matchId);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { listingId, matchId }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        toast({
          title: "Payment Started",
          description: "Complete your payment in the new tab"
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to start payment process",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const platformFee = Math.round(amount * 0.12 * 100) / 100;
  const finalAmount = Math.max(amount, 5);

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Delivery Fee:</span>
          <span>${finalAmount}</span>
        </div>
        <div className="flex justify-between">
          <span>Platform Fee (12%):</span>
          <span>${platformFee}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-1">
          <span>Total:</span>
          <span>${finalAmount}</span>
        </div>
      </div>
      
      <Button 
        onClick={handlePayment} 
        disabled={disabled || loading}
        className="w-full"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <DollarSign className="h-4 w-4 mr-2" />
            Pay ${finalAmount} (Escrow)
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Payment held in escrow until delivery confirmed by both parties
      </p>
    </div>
  );
};
