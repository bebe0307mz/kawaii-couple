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

    // Atomic dedupe: insert into signup_notifications. PK conflict means
    // this user was already notified, so we no-op.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase
      .from("signup_notifications")
      .insert({ user_id: userId } as any)
      .select("user_id") as any);

    // Postgres unique_violation = 23505 → already notified
    const fresh = !error && Array.isArray(data) && data.length > 0;

    if (fresh) {
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

    return NextResponse.json({ ok: true, fresh });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
