import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface SmsRequest {
  to: string;
  message: string;
  type: "booking_notification" | "contact_landlord";
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

    const body: SmsRequest = await req.json();
    if (!body.to || !body.message || !body.type) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipient = formatPhone(body.to);
    const apiKey = Deno.env.get("GAVA_CONNECT_API_KEY");
    const sender = Deno.env.get("GAVA_CONNECT_SENDER_ID") ?? "HUNT";

    let status: "delivered" | "failed" | "pending" = "pending";

    if (apiKey) {
      // === REAL GAVA CONNECT ===
      try {
        const res = await fetch("https://api.gavaconnect.com/v1/sms/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: recipient,
            message: body.message,
            sender_id: sender,
          }),
        });
        status = res.ok ? "delivered" : "failed";
      } catch (e) {
        console.error("Gava SMS error:", e);
        status = "failed";
      }
    } else {
      // === SIMULATED MODE ===
      status = "delivered";
      console.log(`[SIMULATED SMS] To: ${recipient} | ${body.message}`);
    }

    const { data, error } = await supabase
      .from("sms_logs")
      .insert({
        recipient,
        message: body.message,
        type: body.type,
        status,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, sms: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-sms error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
