import { NextRequest, NextResponse } from "next/server";

function getBackendBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  return raw ? raw.replace(/\/$/, "") : null;
}

function buildForwardHeaders(req: NextRequest) {
  const out: Record<string, string> = {};

  const allowList = [
    "authorization",
    "x-forwarded-for",
    "x-forwarded-proto",
    "x-forwarded-host",
    "x-real-ip",
    "user-agent",
    "accept",
    "accept-language",
    "korapay-signature",
    "x-korapay-signature",
  ];

  for (const key of allowList) {
    const v = req.headers.get(key);
    if (v) out[key] = v;
  }

  // Ensure JSON content type for the backend
  out["content-type"] = "application/json";

  return out;
}

// Korapay webhook (POST)
export async function POST(req: NextRequest) {
  const base = getBackendBaseUrl();

  // Always return 200 to Korapay to prevent retries,
  // but still log clearly if misconfigured.
  if (!base) {
    console.error("[Webhook] NEXT_PUBLIC_API_BASE_URL is not defined");
    return NextResponse.json({ received: true, error: "env_missing" }, { status: 200 });
  }

  try {
    const body = await req.text();
    const headers = buildForwardHeaders(req);

    const backendUrl = `${base}/billing/verify`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers,
      body,
    });

    console.log("[Webhook] Korapay notification received and forwarded to backend");
    console.log("[Webhook] Backend response status:", response.status);

    // Return 200 to Korapay regardless of backend response
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Error processing payment notification:", error);

    // Still return 200 to Korapay to prevent retries
    return NextResponse.json(
      { received: true, error: "processing_failed" },
      { status: 200 }
    );
  }
}

// Korapay only sends POST requests
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
