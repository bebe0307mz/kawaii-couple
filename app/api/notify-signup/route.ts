import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

const DISCORD_SIGNUP_URL = "https://discord.com/api/webhooks/1484921311498207472/OY0JwlGmeU1Q1pTQR-DqeO6E-EWWBC0DfWsBEICR4X4XJylLF-R4hn1BkjSN-ehK0UDP";

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json();
    if (!email || !userId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // First app wins: only set signup_source if currently null. The row count
    // doubles as a dedupe — if no rows updated, this user was already notified
    // by another roast-lab app.
    const { count } = await (supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ signup_source: "kawaii" } as any)
      .eq("id", userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .is("signup_source", null) as any)
      .select("id", { count: "exact", head: true });

    if (count && count > 0) {
      await fetch(DISCORD_SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Roast Lab",
          embeds: [{
            title: "New Signup",
            color: 0xff69b4,
            fields: [
              { name: "App", value: "Kawaii Couple", inline: true },
              { name: "Email", value: email, inline: true },
              { name: "User ID", value: userId, inline: false },
            ],
            timestamp: new Date().toISOString(),
          }],
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
