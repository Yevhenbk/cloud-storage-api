'use server';

import { uploadToGCS } from '@/lib/gcs';
import crypto from 'crypto';

type EndpointConfig = {
  name: string;
  url: string;
  provider: 'DOTT' | 'BIRD';
  fetchFrequency: 'always' | 'daily' | 'weekly' | 'monthly';
  detectChanges?: boolean;
  lastFetched?: number; // timestamp
  lastHash?: string;
};

const apiSchedule: EndpointConfig[] = [
  // DOTT
  { name: 'dott_free_bike_status', url: 'https://gbfs.api.ridedott.com/public/v2/rome/free_bike_status.json', provider: 'DOTT', fetchFrequency: 'always' },
  { name: 'dott_geofencing', url: 'https://gbfs.api.ridedott.com/public/v2/rome/geofencing_zones.json', provider: 'DOTT', fetchFrequency: 'weekly', detectChanges: true },
  { name: 'dott_system_info', url: 'https://gbfs.api.ridedott.com/public/v2/rome/system_information.json', provider: 'DOTT', fetchFrequency: 'weekly', detectChanges: true },
  { name: 'dott_pricing', url: 'https://gbfs.api.ridedott.com/public/v2/rome/system_pricing_plans.json', provider: 'DOTT', fetchFrequency: 'always', detectChanges: true },
  { name: 'dott_vehicle_types', url: 'https://gbfs.api.ridedott.com/public/v2/rome/vehicle_types.json', provider: 'DOTT', fetchFrequency: 'monthly' },
  { name: 'dott_station_info', url: 'https://gbfs.api.ridedott.com/public/v2/rome/station_information.json', provider: 'DOTT', fetchFrequency: 'always' },
  { name: 'dott_station_status', url: 'https://gbfs.api.ridedott.com/public/v2/rome/station_status.json', provider: 'DOTT', fetchFrequency: 'always' },

  // BIRD
  { name: 'bird_free_bike_status', url: 'https://mds.bird.co/gbfs/v2/public/rome/free_bike_status.json', provider: 'BIRD', fetchFrequency: 'always' },
  { name: 'bird_geofencing', url: 'https://mds.bird.co/gbfs/v2/public/rome/geofencing_zones.json', provider: 'BIRD', fetchFrequency: 'weekly', detectChanges: true },
  { name: 'bird_system_info', url: 'https://mds.bird.co/gbfs/v2/public/rome/system_information.json', provider: 'BIRD', fetchFrequency: 'monthly', detectChanges: true },
  { name: 'bird_pricing', url: 'https://mds.bird.co/gbfs/v2/public/rome/system_pricing_plans.json', provider: 'BIRD', fetchFrequency: 'always', detectChanges: true },
  { name: 'bird_regions', url: 'https://mds.bird.co/gbfs/v2/public/rome/system_regions.json', provider: 'BIRD', fetchFrequency: 'weekly' },
  { name: 'bird_vehicle_types', url: 'https://mds.bird.co/gbfs/v2/public/rome/vehicle_types.json', provider: 'BIRD', fetchFrequency: 'weekly' },
];

const lastState: Record<string, { lastHash?: string; lastFetched?: number }> = {};

function hashJSON(data: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function shouldFetch(config: EndpointConfig): boolean {
  if (config.fetchFrequency === 'always') return true;

  const now = Date.now();
  const last = lastState[config.name]?.lastFetched ?? 0;
  const diff = now - last;

  switch (config.fetchFrequency) {
    case 'daily': return diff >= 1000 * 60 * 60 * 24;
    case 'weekly': return diff >= 1000 * 60 * 60 * 24 * 7;
    case 'monthly': return diff >= 1000 * 60 * 60 * 24 * 30;
    default: return false;
  }
}

export async function sendToCloud(): Promise<{ success: true; uploaded: string[] } | { success: false; message: string }> {
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
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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
    console.error('❌ sendToCloud failed:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return { success: false, message: 'Failed during upload' };
  }
}
