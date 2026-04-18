import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface STKPushRequest {
  phone: string;
  amount: number;
  bookingId: string;
  propertyId: string;
  propertyTitle: string;
}

const formatPhone = (phone: string): string => {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;
  return p;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub;
    const body: STKPushRequest = await req.json();

    if (!body.phone || !body.amount || !body.bookingId || !body.propertyId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formattedPhone = formatPhone(body.phone);
    const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET");
    const shortcode = Deno.env.get("DARAJA_SHORTCODE") ?? "174379";
    const passkey = Deno.env.get("DARAJA_PASSKEY");

    let transactionId: string;
    let mode: "real" | "simulated";

    if (consumerKey && consumerSecret && passkey) {
      // === REAL DARAJA STK PUSH ===
      mode = "real";
      const auth = btoa(`${consumerKey}:${consumerSecret}`);
      const tokenRes = await fetch(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        { headers: { Authorization: `Basic ${auth}` } }
      );
      const { access_token } = await tokenRes.json();

      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
      const password = btoa(`${shortcode}${passkey}${timestamp}`);

      const stkRes = await fetch(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.round(body.amount),
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`,
            AccountReference: body.bookingId.slice(0, 12),
            TransactionDesc: `Rent: ${body.propertyTitle.slice(0, 20)}`,
          }),
        }
      );
      const stkData = await stkRes.json();
      transactionId = stkData.CheckoutRequestID ?? `MPESA${Date.now()}`;
    } else {
      // === SIMULATED MODE (no Daraja keys yet) ===
      mode = "simulated";
      transactionId = `SIM${Date.now().toString().slice(-10)}`;
    }

    // Record payment
    const { error: payError } = await supabase.from("payments").insert({
      user_id: userId,
      booking_id: body.bookingId,
      property_id: body.propertyId,
      amount: body.amount,
      phone: formattedPhone,
      transaction_id: transactionId,
    });
    if (payError) throw payError;

    // Mark booking paid + confirmed
    const { error: bookError } = await supabase
      .from("bookings")
      .update({ payment_status: "paid", status: "confirmed" })
      .eq("id", body.bookingId);
    if (bookError) throw bookError;

    return new Response(
      JSON.stringify({ success: true, transactionId, mode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("mpesa-stk-push error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
