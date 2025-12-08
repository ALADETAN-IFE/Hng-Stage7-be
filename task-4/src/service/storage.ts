import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Helper function to construct B2 endpoint URL
function getB2Endpoint(): string {
  const region = process.env.B2_REGION || "us-west-004";
  const customEndpoint = process.env.B2_ENDPOINT;
  
  // If B2_ENDPOINT is provided and is a valid URL, use it
  if (customEndpoint) {
    // Check if it's already a full URL
    if (customEndpoint.startsWith("http://") || customEndpoint.startsWith("https://")) {
      return customEndpoint;
    }
    // If it's just a region name (no protocol), construct the URL
    if (!customEndpoint.includes("://")) {
      return `https://s3.${customEndpoint}.backblazeb2.com`;
    }
  }
  
  // Default: construct from region
  return `https://s3.${region}.backblazeb2.com`;
}

// Backblaze B2 S3-compatible endpoint
const B2_ENDPOINT = getB2Endpoint();
const B2_REGION = process.env.B2_REGION || "us-west-004";
const B2_BUCKET = process.env.B2_BUCKET_NAME || "";
const B2_ACCESS_KEY_ID = process.env.B2_APPLICATION_KEY_ID || "";
const B2_SECRET_ACCESS_KEY = process.env.B2_APPLICATION_KEY || "";

// Validate endpoint is a proper URL
if (!B2_ENDPOINT.startsWith("http://") && !B2_ENDPOINT.startsWith("https://")) {
  throw new Error(
    `Invalid B2_ENDPOINT configuration: "${B2_ENDPOINT}". ` +
    `It must be a full URL (e.g., https://s3.us-west-004.backblazeb2.com) or a region name (e.g., us-west-004). ` +
    `Current B2_ENDPOINT: "${process.env.B2_ENDPOINT}", B2_REGION: "${B2_REGION}"`
  );
}

// Initialize S3 client for Backblaze B2 (lazy initialization to ensure env vars are loaded)
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: B2_ENDPOINT,
      region: B2_REGION,
      credentials: {
        accessKeyId: B2_ACCESS_KEY_ID,
        secretAccessKey: B2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true, // Required for Backblaze B2
    });
  }
  return s3Client as S3Client; // Type assertion: s3Client is guaranteed to be non-null here
}

export interface UploadResult {
  key: string;
  bucket: string;
  url?: string;
}

//   Upload a file buffer to Backblaze B2
export async function uploadToB2(
  buffer: Buffer,
  filename: string,
  contentType: string,
  id?: string
): Promise<UploadResult> {
  if (!B2_BUCKET || !B2_ACCESS_KEY_ID || !B2_SECRET_ACCESS_KEY) {
    throw new Error(
      "Backblaze B2 credentials not configured. Please set B2_BUCKET_NAME, B2_APPLICATION_KEY_ID, and B2_APPLICATION_KEY environment variables."
    );
  }

  const timestamp = id || Date.now().toString();
  const key = `documents/${timestamp}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: B2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await getS3Client().send(command);

  return {
    key,
    bucket: B2_BUCKET,
  };
}

//  Get a file from Backblaze B2 as a buffer
export async function getFromB2(key: string): Promise<Buffer> {
  if (!B2_BUCKET || !B2_ACCESS_KEY_ID || !B2_SECRET_ACCESS_KEY) {
    throw new Error(
      "Backblaze B2 credentials not configured. Please set B2_BUCKET_NAME, B2_APPLICATION_KEY_ID, and B2_APPLICATION_KEY environment variables."
    );
  }

  const command = new GetObjectCommand({
    Bucket: B2_BUCKET,
    Key: key,
  });

  const response = await getS3Client().send(command);
  
  if (!response.Body) {
    throw new Error(`File not found: ${key}`);
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

//  * Generate a presigned URL for accessing a file (optional, for direct downloads)
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (!B2_BUCKET || !B2_ACCESS_KEY_ID || !B2_SECRET_ACCESS_KEY) {
    throw new Error(
      "Backblaze B2 credentials not configured. Please set B2_BUCKET_NAME, B2_APPLICATION_KEY_ID, and B2_APPLICATION_KEY environment variables."
    );
  }

  const command = new GetObjectCommand({
    Bucket: B2_BUCKET,
    Key: key,
  });

  return await getSignedUrl(getS3Client(), command, { expiresIn });
}

