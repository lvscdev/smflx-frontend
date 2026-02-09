import { NextRequest, NextResponse } from 'next/server';

/**
 * Korapay Webhook Handler
 * 
 * Korapay sends server-to-server notifications here when payment status changes.
 * This endpoint proxies the webhook to our backend which updates payment records.
 * 
 * Security: Korapay sends a signature header for verification - backend must verify it.
 */

const BACKEND_BASE_URL = process.env.SMFLX_BACKEND_BASE_URL || 'https://api.smflx.org';

export async function POST(request: NextRequest) {
  try {
    // Read the raw body (needed for signature verification on backend)
    const body = await request.text();
    
    // Forward all Korapay headers to backend (includes signature)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Forward relevant headers
      if (
        key.toLowerCase().startsWith('x-korapay') ||
        key === 'content-type' ||
        key === 'user-agent'
      ) {
        headers[key] = value;
      }
    });

    // Proxy to backend webhook endpoint
    const backendUrl = `${BACKEND_BASE_URL}/billing/verify`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body,
    });

    // Log for debugging (remove in production or use proper logging)
    console.log('[Webhook] Korapay notification received and forwarded to backend');
    console.log('[Webhook] Backend response status:', response.status);

    // Return success to Korapay regardless of backend response
    // (Korapay expects 200 OK to confirm receipt)
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('[Webhook] Error processing payment notification:', error);
    
    // Still return 200 to Korapay to prevent retries
    // Log the error for investigation
    return NextResponse.json(
      { received: true, error: 'processing_failed' },
      { status: 200 }
    );
  }
}

// Korapay only sends POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
