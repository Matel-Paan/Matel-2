import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages";
const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN"); // Stored safely in Supabase Edge Secrets

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { customerId, businessId } = await req.json();
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 1. Verify Admin calling this function
    const { data: userData } = await supabaseClient.auth.getUser();
    if (!userData.user) throw new Error("Unauthorized");

    // 2. Fetch Customer Data & Outstanding Balance securely
    const { data: customer } = await supabaseClient
        .from('customers')
        .select('phone, full_name, outstanding_balance')
        .eq('id', customerId)
        .eq('business_id', businessId)
        .single();

    if (!customer) throw new Error("Customer not found");

    // 3. Send WhatsApp via Meta API
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: customer.phone,
        type: "template",
        template: {
          name: "payment_reminder", // Template created in Facebook Developer Dashboard
          language: { code: "hi" },
          components: [
            { type: "body", parameters: [{ type: "text", text: customer.full_name }, { type: "text", text: customer.outstanding_balance.toString() }] }
          ]
        }
      })
    });

    const result = await response.json();
    return new Response(JSON.stringify({ success: true, result }), { headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } });
  }
})
