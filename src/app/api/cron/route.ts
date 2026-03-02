export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendToCloud, downloadGTFSFiles } from "@/actions/actions";

export async function GET(): Promise<NextResponse> {
  console.log("⏱ Server-side upload trigger");

  try {
    // Run both functions in parallel
    const [uploadResult, gtfsResult] = await Promise.all([
      sendToCloud(),
      downloadGTFSFiles(),
    ]);

    return NextResponse.json({
      message: "Cron job completed",
      upload: uploadResult,
      gtfs: gtfsResult,
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      { message: "Cron job failed", error: String(error) },
      { status: 500 }
    );
  }
}
