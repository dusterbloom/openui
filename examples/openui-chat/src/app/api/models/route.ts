import { NextResponse } from "next/server";

export async function GET() {
  const baseURL = process.env.OPENAI_BASE_URL ?? "http://localhost:8000/v1";
  const apiKey = process.env.OPENAI_API_KEY ?? "omlx";

  try {
    const res = await fetch(`${baseURL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    const models = (data.data ?? []).map((m: { id: string }) => m.id).sort();
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [] }, { status: 502 });
  }
}
