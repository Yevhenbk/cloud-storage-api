export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendToCloud } from "@/actions/actions";

export async function GET(): Promise<NextResponse> {
  console.log("⏱ Server-side upload trigger");

  const result = await sendToCloud();

  if (result.success) {
    return NextResponse.json({
      message: "Upload completed",
      uploaded: result.uploaded,
    });
  } else {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }
}
