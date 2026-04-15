import { NextRequest, NextResponse } from "next/server";

/**
 * Helius Webhook Handler
 * Listens for transactions on the taphit program.
 * Updates Supabase when orders are placed or settled.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Helius Webhook] Received:", JSON.stringify(body).slice(0, 200));

    // Process webhook events and update Supabase
    // In production: parse tx signatures, update orders table, trigger Realtime

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[Helius Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
