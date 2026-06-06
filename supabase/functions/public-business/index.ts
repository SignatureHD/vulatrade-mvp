import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return json({ ok: false, error: "Missing business slug." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ ok: false, error: "Server is not configured." }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id,name,owner,category,area,whatsapp,description,slug,theme,background_style,font,catalogue")
    .eq("slug", slug)
    .single();

  if (businessError || !business) {
    return json({ ok: false, error: "Business not found." }, 404);
  }

  const [{ data: products }, { data: reviews }] = await Promise.all([
    supabase
      .from("products")
      .select("name,price,image,description,is_active")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true }),

    supabase
      .from("reviews")
      .select("customer_name,rating,review_text")
      .eq("business_id", business.id)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return json({
    ok: true,
    business: {
      name: business.name,
      owner: business.owner,
      category: business.category,
      area: business.area,
      whatsapp: business.whatsapp,
      description: business.description,
      slug: business.slug,
      theme: business.theme,
      backgroundStyle: business.background_style,
      font: business.font,
      catalogue: business.catalogue,
      publicUrl: `https://www.vulatrade.co.za/b/${business.slug}`,
    },
    products: products ?? [],
    reviews: reviews ?? [],
  });
});
