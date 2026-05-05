import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { userId, paths } = await req.json();
    if (!userId || !Array.isArray(paths)) {
      return new Response(JSON.stringify({ error: "userId and paths required" }), { status: 400, headers: corsHeaders });
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const safe = paths.filter((p: string) => typeof p === "string" && p.startsWith(`${userId}/`));
    const { data, error } = await admin.storage.from("recordings").createSignedUrls(safe, 3600);
    if (error) throw error;
    return new Response(JSON.stringify({ urls: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});