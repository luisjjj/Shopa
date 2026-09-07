import { NextResponse } from "next/server";

export function serverError(
  context: string,
  error: unknown,
  friendly = "Something went wrong. Please try again."
): NextResponse {
  const detail = error instanceof Error ? error.message : String(error ?? "unknown");
  console.error(`[api:${context}]`, detail);
  return NextResponse.json({ error: friendly }, { status: 500 });
}
