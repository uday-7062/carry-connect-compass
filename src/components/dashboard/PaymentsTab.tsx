
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeliveryConfirmation } from '@/components/DeliveryConfirmation';
import { Loader2, DollarSign, TrendingUp } from 'lucide-react';

export const PaymentsTab = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalPaid: 0,
    pendingPayments: 0
  });
  const { profile } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          listings (
            title,
            origin,
            destination
          ),
          delivery_confirmations (
            confirmed_by_sender,
            confirmed_by_traveler,
            sender_confirmed_at,
            traveler_confirmed_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);

      // Calculate stats
      const earned = data?.filter(p => p.traveler_id === profile?.id && p.status === 'released')
        .reduce((sum, p) => sum + Number(p.traveler_amount_usd), 0) || 0;
      
      const paid = data?.filter(p => p.sender_id === profile?.id)
        .reduce((sum, p) => sum + Number(p.amount_usd), 0) || 0;
      
      const pending = data?.filter(p => p.status === 'held').length || 0;

      setStats({
        totalEarned: earned,
        totalPaid: paid,
        pendingPayments: pending
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-600">${stats.totalEarned}</div>
            <div className="text-xs text-gray-600">Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-600">${stats.totalPaid}</div>
            <div className="text-xs text-gray-600">Paid</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Badge variant="outline" className="text-xs">
                {stats.pendingPayments}
              </Badge>
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Recent Transactions</h3>
        
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet.</p>
            <p className="text-sm mt-1">Start accepting deliveries to see payments here!</p>
          </div>
        ) : (
          payments.map((payment) => (
            <DeliveryConfirmation key={payment.id} payment={payment} />
          ))
        )}
      </div>
    </div>
  );
};
