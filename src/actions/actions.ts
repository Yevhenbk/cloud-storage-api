"use server";

import { uploadToGCS } from "@/lib/gcs";
import crypto from "crypto";
import apiSchedule, { EndpointConfig } from "@/lib/apiSchedule";

const lastState: Record<string, { lastHash?: string; lastFetched?: number }> =
  {};

function hashJSON(data: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

function shouldFetch(config: EndpointConfig): boolean {
  if (config.fetchFrequency === "always") return true;

  const now = Date.now();
  const last = lastState[config.name]?.lastFetched ?? 0;
  const diff = now - last;

  switch (config.fetchFrequency) {
    case "daily":
      return diff >= 1000 * 60 * 60 * 24;
    case "weekly":
      return diff >= 1000 * 60 * 60 * 24 * 7;
    case "monthly":
      return diff >= 1000 * 60 * 60 * 24 * 30;
    default:
      return false;
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function getLocalTimestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

export async function sendToCloud(): Promise<
  { success: true; uploaded: string[] } | { success: false; message: string }
> {
  const uploaded: string[] = [];

  try {
    for (const config of apiSchedule) {
      if (!shouldFetch(config)) continue;

      const res = await fetch(config.url);

      if (!res.ok) {
        console.error(`❌ Failed to fetch ${config.name}: ${res.status}`);
        continue;
      }

      const json = await res.json();
      const newHash = config.detectChanges ? hashJSON(json) : undefined;
      const prevHash = lastState[config.name]?.lastHash;

      const hasChanged = config.detectChanges ? newHash !== prevHash : true;

      if (hasChanged) {
        const timestamp = getLocalTimestamp();
        const fileName = `${config.name}/${timestamp}.json`;

        await uploadToGCS(json, fileName);
        uploaded.push(fileName);

        lastState[config.name] = {
          lastHash: newHash,
          lastFetched: Date.now(),
        };

        if (config.detectChanges) {
          console.log(`📦 ${config.name} changed. Uploaded as: ${fileName}`);
        }
      } else {
        console.log(`🟡 ${config.name} unchanged. Skipping upload.`);
      }
    }

    return { success: true, uploaded };
  } catch (err) {
    console.error(
      "❌ sendToCloud failed:",
      JSON.stringify(err, Object.getOwnPropertyNames(err))
    );
    return { success: false, message: "Failed during upload" };
  }
}
