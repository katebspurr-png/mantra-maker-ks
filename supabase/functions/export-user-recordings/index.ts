const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: claimsError } = await userClient.auth.getClaims();
    if (claimsError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
    }
    const userId = claims.claims.sub as string;

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: recs, error: recsError } = await admin
      .from("recordings")
      .select("id, title, audio_file_path, duration_seconds, created_at, tags")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (recsError) throw recsError;

    const paths = (recs ?? [])
      .map((r: any) => r.audio_file_path)
      .filter((p: string) => typeof p === "string" && p.startsWith(`${userId}/`));

    if (paths.length === 0) {
      return new Response(JSON.stringify({ recordings: [], urls: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signed, error: signError } = await admin.storage
      .from("recordings")
      .createSignedUrls(paths, 3600);
    if (signError) throw signError;

    return new Response(
      JSON.stringify({ recordings: recs, urls: signed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});