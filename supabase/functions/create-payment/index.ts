
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
    
    if (!user?.email) throw new Error("User not authenticated");

    const { listingId, matchId } = await req.json();
    console.log('Creating payment for listing:', listingId, 'match:', matchId);

    // Get listing and match details
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select('*, profiles!listings_user_id_fkey(full_name)')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) throw new Error("Listing not found");

    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) throw new Error("Match not found");

    // Calculate fees (12% platform fee, minimum $5)
    const amount = Math.max(listing.price_usd, 5);
    const platformFee = Math.round(amount * 0.12 * 100) / 100; // 12%
    const travelerAmount = amount - platformFee;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create payment intent with hold (manual capture)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      customer: customerId,
      capture_method: "manual", // Hold funds until delivery confirmation
      metadata: {
        listingId,
        matchId,
        senderId: match.sender_id,
        travelerId: match.traveler_id,
        platformFee: platformFee.toString(),
        travelerAmount: travelerAmount.toString()
      }
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_intent_data: {
        capture_method: "manual",
        metadata: {
          listingId,
          matchId,
          senderId: match.sender_id,
          travelerId: match.traveler_id
        }
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Delivery: ${listing.title}`,
              description: `${listing.origin} → ${listing.destination}`
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?tab=messages&payment=success`,
      cancel_url: `${req.headers.get("origin")}/dashboard?tab=messages&payment=cancelled`,
    });

    // Store payment record
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: paymentError } = await supabaseService
      .from("payments")
      .insert({
        listing_id: listingId,
        sender_id: match.sender_id,
        traveler_id: match.traveler_id,
        amount_usd: amount,
        platform_fee_usd: platformFee,
        traveler_amount_usd: travelerAmount,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending'
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw new Error("Failed to create payment record");
    }

    console.log('Payment session created successfully');
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
