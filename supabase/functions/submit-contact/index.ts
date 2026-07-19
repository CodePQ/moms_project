// Deploy with:
//   supabase functions deploy submit-contact --no-verify-jwt
//
// No secrets need to be set manually - SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are injected automatically by the Edge
// Functions runtime for every function in the project.

import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://lorrainepaquette.com",
  "https://www.lorrainepaquette.com",
]);

// TEMPORARY, for pre-merge testing in a GitHub Codespace: allow any Codespaces
// preview URL (e.g. https://my-codespace-name-8000.app.github.dev). Remove
// this once testing is done - see the comment further down.
const CODESPACE_ORIGIN_RE = /^https:\/\/[a-z0-9-]+-\d+\.app\.github\.dev$/;

const MIN_SECONDS_BEFORE_SUBMIT = 3;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = new Set(["contact_form", "circle_interest"]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.has(origin) || CODESPACE_ORIGIN_RE.test(origin);
}

function corsHeaders(origin: string | null) {
  const allowOrigin = isAllowedOrigin(origin) ? origin! : "https://lorrainepaquette.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : ""; // honeypot
  const renderedAt = typeof body.renderedAt === "number" ? body.renderedAt : 0;
  const source = typeof body.source === "string" && ALLOWED_SOURCES.has(body.source) ? body.source : "contact_form";

  // Silent spam rejection: pretend success so bots don't learn what tripped them.
  const submittedTooFast = Date.now() - renderedAt < MIN_SECONDS_BEFORE_SUBMIT * 1000;
  if (company !== "" || submittedTooFast) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  }

  if (!name || name.length > 100) {
    return new Response(JSON.stringify({ error: "Please provide a valid name." }), { status: 400, headers });
  }
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: "Please provide a valid email." }), { status: 400, headers });
  }
  if (message.length > 2000) {
    return new Response(JSON.stringify({ error: "Message is too long." }), { status: 400, headers });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = await hashIp(ip);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (countError) {
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), { status: 500, headers });
  }
  if ((count ?? 0) >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return new Response(JSON.stringify({ error: "Too many submissions. Please try again later." }), { status: 429, headers });
  }

  const { error: insertError } = await supabase
    .from("contacts")
    .insert({ name, email, message: message || null, ip_hash: ipHash, source });

  if (insertError) {
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), { status: 500, headers });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
});
