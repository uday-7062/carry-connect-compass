
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) throw new Error("User not authenticated");

    const { paymentId, userType } = await req.json();
    console.log('Confirming delivery for payment:', paymentId, 'by:', userType);

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseService
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) throw new Error("Payment not found");

    // Check if user is authorized
    const isAuthorized = (userType === 'sender' && payment.sender_id === user.id) ||
                        (userType === 'traveler' && payment.traveler_id === user.id);
    
    if (!isAuthorized) throw new Error("Not authorized to confirm this delivery");

    // Get or create delivery confirmation record
    let { data: confirmation } = await supabaseService
      .from('delivery_confirmations')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (!confirmation) {
      const { data: newConfirmation, error: insertError } = await supabaseService
        .from('delivery_confirmations')
        .insert({ payment_id: paymentId })
        .select()
        .single();
      
      if (insertError) throw new Error("Failed to create confirmation record");
      confirmation = newConfirmation;
    }

    // Update confirmation based on user type
    const updateData: any = {};
    if (userType === 'sender') {
      updateData.confirmed_by_sender = true;
      updateData.sender_confirmed_at = new Date().toISOString();
    } else {
      updateData.confirmed_by_traveler = true;
      updateData.traveler_confirmed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseService
      .from('delivery_confirmations')
      .update(updateData)
      .eq('id', confirmation.id);

    if (updateError) throw new Error("Failed to update confirmation");

    // Check if both parties have confirmed
    const { data: updatedConfirmation } = await supabaseService
      .from('delivery_confirmations')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    const bothConfirmed = updatedConfirmation?.confirmed_by_sender && 
                         updatedConfirmation?.confirmed_by_traveler;

    if (bothConfirmed && payment.stripe_payment_intent_id) {
      console.log('Both parties confirmed, releasing payment');
      
      // Capture the payment (release from escrow)
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2023-10-16",
      });

      await stripe.paymentIntents.capture(payment.stripe_payment_intent_id);

      // Update payment status
      await supabaseService
        .from('payments')
        .update({ 
          status: 'released',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      // Update match status
      const { data: match } = await supabaseService
        .from('matches')
        .select('id')
        .eq('listing_id', payment.listing_id)
        .eq('sender_id', payment.sender_id)
        .eq('traveler_id', payment.traveler_id)
        .single();

      if (match) {
        await supabaseService
          .from('matches')
          .update({ status: 'completed' })
          .eq('id', match.id);
      }

      console.log('Payment released successfully');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      bothConfirmed,
      message: bothConfirmed ? 'Payment released!' : 'Confirmation recorded'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Delivery confirmation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
