import { NextRequest, NextResponse } from "next/server";

function getBackendBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw) {
    // Do NOT throw at module scope. Return a response error when called.
    return null;
  }
  return raw.replace(/\/$/, "");
}

function buildTargetUrl(base: string, pathSegments: string[]) {
  const path = pathSegments.map(encodeURIComponent).join("/");
  return `${base}/${path}`;
}

async function proxy(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const base = getBackendBaseUrl(); if (!base) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_BASE_URL is not defined" },
      { status: 500 }
    );
  }

  const { path: pathSegments = [] } = await context.params;
  const incomingUrl = new URL(req.url);
  const target = new URL(buildTargetUrl(base, pathSegments));
  target.search = incomingUrl.search;

  // Build safe upstream headers
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding"); // critical
  headers.set("accept-encoding", "identity"); // critical

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[proxy]",
      req.method,
      target.toString(),
      "auth?",
      !!req.headers.get("authorization"),
    );
  }

  const upstream = await fetch(target.toString(), {
    method: req.method,
    headers,
    body: body ? Buffer.from(body) : undefined,
  });

  // Read as raw bytes so we control headers
  const buf = await upstream.arrayBuffer();

  // Copy headers but remove encoding/length and caching headers
  const outHeaders = new Headers(upstream.headers);
  outHeaders.delete("content-encoding"); // critical
  outHeaders.delete("content-length");   // critical
  
  // Remove caching headers to ensure fresh data
  outHeaders.delete("etag");
  outHeaders.delete("cache-control");
  outHeaders.delete("last-modified");
  outHeaders.delete("expires");
  
  // Set no-cache headers for dynamic content
  outHeaders.set("cache-control", "no-store, must-revalidate");

  return new NextResponse(buf, {
    status: upstream.status,
    headers: outHeaders,
  });
}

export async function GET(req: NextRequest, ctx: any) { return proxy(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return proxy(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return proxy(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return proxy(req, ctx); }