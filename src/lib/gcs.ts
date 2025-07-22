import { Storage, Bucket } from '@google-cloud/storage';

function getGCSConfig() {
  const {
    GCP_PROJECT_ID,
    GCP_CLIENT_EMAIL,
    GCP_PRIVATE_KEY,
    GCP_BUCKET,
  } = process.env;

  if (!GCP_PROJECT_ID || !GCP_CLIENT_EMAIL || !GCP_PRIVATE_KEY || !GCP_BUCKET) {
    throw new Error('Missing required Google Cloud environment variables.');
  }

  return {
    projectId: GCP_PROJECT_ID,
    clientEmail: GCP_CLIENT_EMAIL,
    privateKey: GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
    bucketName: GCP_BUCKET,
  };
}

/**
 * Uploads data to Google Cloud Storage using a custom file name.
 * @param data - Serializable JSON data.
 * @param fileName - Full filename including any desired path/prefix.
 * @returns The name of the uploaded file.
 */
export async function uploadToGCS(data: any, fileName: string): Promise<string> {
  const { projectId, clientEmail, privateKey, bucketName } = getGCSConfig();

  const storage = new Storage({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });

  const bucket: Bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);

  await file.save(JSON.stringify(data), {
    contentType: 'application/json',
    gzip: true,
  });

  return fileName;
}
