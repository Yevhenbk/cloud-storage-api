import axios from "axios";

export type GTFSFileConfig = {
  name: string;
  filePattern: RegExp;
  fetchFrequency: "15mins" | "daily";
  lastFetched?: number;
};

const gtfsSchedule: GTFSFileConfig[] = [
  {
    name: "gtfs_pb_files",
    filePattern: /\.pb$/i,
    fetchFrequency: "15mins",
  },
  {
    name: "gtfs_zip_files",
    filePattern: /\.zip$/i,
    fetchFrequency: "daily",
  },
];

const gtfsLastState: Record<string, { lastFetched?: number }> = {};

const ROMA_MOBILITA_URL =
  "https://romamobilita.it/sistemi-e-tecnologie/open-data/?utm_source=chatgpt.com";

const GTFS_BUCKET_FOLDER = process.env.GCS_GTFS_FOLDER || "gtfs-datasets";

function shouldFetch(config: GTFSFileConfig): boolean {
  const now = Date.now();
  const last = gtfsLastState[config.name]?.lastFetched ?? 0;
  const diff = now - last;

  switch (config.fetchFrequency) {
    case "15mins":
      return diff >= 1000 * 60 * 15;
    case "daily":
      return diff >= 1000 * 60 * 60 * 24;
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

// Fetch the HTML page and extract download links
async function fetchDownloadLinks(
  filePattern: RegExp
): Promise<{ url: string; fileName: string }[]> {
  try {
    const response = await axios.get(ROMA_MOBILITA_URL, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = response.data;

    // Extract all href links from the HTML
    const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
    const links: { url: string; fileName: string }[] = [];

    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      const fileName = url.split("/").pop();

      if (fileName && filePattern.test(fileName)) {
        links.push({ url, fileName });
      }
    }

    return links;
  } catch (error) {
    console.error("❌ Failed to fetch Roma Mobilita page:", error);
    return [];
  }
}

// Download a single file from URL
async function downloadFile(
  url: string,
  fileName: string
): Promise<Buffer | null> {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 60000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    console.log(`✅ Downloaded: ${fileName} (${response.data.length} bytes)`);
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`❌ Failed to download ${fileName}:`, error);
    return null;
  }
}

// Upload binary file to GCS
async function uploadBinaryToGCS(
  data: Buffer,
  fileName: string,
  folder: string = GTFS_BUCKET_FOLDER
): Promise<string | null> {
  try {
    const { GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY, GCP_BUCKET } =
      process.env;

    if (
      !GCP_PROJECT_ID ||
      !GCP_CLIENT_EMAIL ||
      !GCP_PRIVATE_KEY ||
      !GCP_BUCKET
    ) {
      throw new Error("Missing required Google Cloud environment variables.");
    }

    const { Storage } = await import("@google-cloud/storage");

    const storage = new Storage({
      projectId: GCP_PROJECT_ID,
      credentials: {
        client_email: GCP_CLIENT_EMAIL,
        private_key: GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
    });

    const bucket = storage.bucket(GCP_BUCKET);
    const fullPath = `${folder}/${fileName}`;
    const file = bucket.file(fullPath);

    await file.save(data, {
      contentType: "application/octet-stream",
    });

    return fullPath;
  } catch (error) {
    console.error(
      "❌ Failed to upload to GCS:",
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );
    return null;
  }
}

export async function downloadGTFSFiles(): Promise<{
  success: boolean;
  downloaded: string[];
  message: string;
}> {
  const downloaded: string[] = [];
  const messages: string[] = [];

  try {
    for (const config of gtfsSchedule) {
      if (!shouldFetch(config)) {
        console.log(
          `🟡 Skipping ${config.name} (not yet time for ${config.fetchFrequency})`
        );
        continue;
      }

      console.log(
        `📥 Fetching ${config.name} (${config.fetchFrequency} frequency)...`
      );

      const links = await fetchDownloadLinks(config.filePattern);

      if (links.length === 0) {
        messages.push(`❌ No files found matching ${config.name} pattern`);
        continue;
      }

      console.log(
        `🔍 Found ${links.length} files matching ${config.name} pattern`
      );

      let downloadedCount = 0;
      for (const { url, fileName } of links) {
        const data = await downloadFile(url, fileName);

        if (data) {
          const timestamp = getLocalTimestamp();
          const gcsFileName = `${timestamp}_${fileName}`;
          const gcsPath = await uploadBinaryToGCS(data, gcsFileName);

          if (gcsPath) {
            downloaded.push(gcsPath);
            downloadedCount++;
          }
        }
      }

      gtfsLastState[config.name] = { lastFetched: Date.now() };

      messages.push(
        `✅ ${config.name}: Downloaded and uploaded ${downloadedCount}/${links.length} files`
      );
    }

    return {
      success: downloaded.length > 0,
      downloaded,
      message: messages.join(" | "),
    };
  } catch (err) {
    console.error(
      "❌ downloadGTFSFiles failed:",
      JSON.stringify(err, Object.getOwnPropertyNames(err))
    );
    return {
      success: false,
      downloaded: [],
      message: "Failed to download GTFS files",
    };
  }
}
