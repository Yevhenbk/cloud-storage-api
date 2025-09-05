export type EndpointConfig = {
  name: string;
  url: string;
  provider: "DOTT" | "BIRD";
  fetchFrequency: "always" | "daily" | "weekly" | "monthly";
  detectChanges?: boolean;
  lastFetched?: number;
  lastHash?: string;
};

const apiSchedule: EndpointConfig[] = [
  // DOTT
  {
    name: "dott_free_bike_status",
    url: "https://gbfs.api.ridedott.com/public/v2/rome/free_bike_status.json",
    provider: "DOTT",
    fetchFrequency: "always",
  },
  {
    name: "dott_geofencing",
    url: "https://gbfs.api.ridedott.com/public/v2/rome/geofencing_zones.json",
    provider: "DOTT",
    fetchFrequency: "weekly",
    detectChanges: true,
  },
  {
    name: "dott_system_info",
    url: "https://gbfs.api.ridedott.com/public/v2/rome/system_information.json",
    provider: "DOTT",
    fetchFrequency: "weekly",
    detectChanges: true,
  },
  {
    name: "dott_pricing",
    url: "https://gbfs.api.ridedott.com/public/v2/rome/system_pricing_plans.json",
    provider: "DOTT",
    fetchFrequency: "always",
    detectChanges: true,
  },
  {
    name: "dott_vehicle_types",
    url: "https://gbfs.api.ridedott.com/public/v2/rome/vehicle_types.json",
    provider: "DOTT",
    fetchFrequency: "monthly",
  },
  {
    name: "dott_station_info",
    url: "https://gbfs.api.ridedott.com/public/v2/rome/station_information.json",
    provider: "DOTT",
    fetchFrequency: "always",
  },
  {
    name: "dott_station_status",
    url: "https://gbfs.api.ridedott.com/public/v2/rome/station_status.json",
    provider: "DOTT",
    fetchFrequency: "always",
  },

  // BIRD
  {
    name: "bird_free_bike_status",
    url: "https://mds.bird.co/gbfs/v2/public/rome/free_bike_status.json",
    provider: "BIRD",
    fetchFrequency: "always",
  },
  {
    name: "bird_geofencing",
    url: "https://mds.bird.co/gbfs/v2/public/rome/geofencing_zones.json",
    provider: "BIRD",
    fetchFrequency: "weekly",
    detectChanges: true,
  },
  {
    name: "bird_system_info",
    url: "https://mds.bird.co/gbfs/v2/public/rome/system_information.json",
    provider: "BIRD",
    fetchFrequency: "monthly",
    detectChanges: true,
  },
  {
    name: "bird_pricing",
    url: "https://mds.bird.co/gbfs/v2/public/rome/system_pricing_plans.json",
    provider: "BIRD",
    fetchFrequency: "always",
    detectChanges: true,
  },
  {
    name: "bird_regions",
    url: "https://mds.bird.co/gbfs/v2/public/rome/system_regions.json",
    provider: "BIRD",
    fetchFrequency: "weekly",
  },
  {
    name: "bird_vehicle_types",
    url: "https://mds.bird.co/gbfs/v2/public/rome/vehicle_types.json",
    provider: "BIRD",
    fetchFrequency: "weekly",
  },
];

export default apiSchedule;