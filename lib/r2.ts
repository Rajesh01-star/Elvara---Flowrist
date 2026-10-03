import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME; // Private bucket
const publicBucketName = process.env.R2_PUBLIC_BUCKET_NAME || process.env.R2_BUCKET_NAME; // Public bucket

export const r2Client = new S3Client({
  region: "auto",
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export { bucketName, publicBucketName };

/**
 * Generate a presigned URL to PUT a file directly into R2 from the client browser.
 */
export async function getUploadPresignedUrl(fileKey: string, contentType: string, isPublic = false) {
  if (!accountId || !accessKeyId || !secretAccessKey || (!bucketName && !publicBucketName)) {
    throw new Error("Cloudflare R2 is not fully configured in environment variables.");
  }

  const targetBucket = isPublic ? publicBucketName || bucketName : bucketName;
  const command = new PutObjectCommand({
    Bucket: targetBucket,
    Key: fileKey,
    ContentType: contentType,
  });

  // URL is valid for 1 hour (3600 seconds)
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return uploadUrl;
}

/**
 * Generate a temporary download URL for a file in R2.
 * Valid for 5 minutes (300 seconds) and forces download as attachment.
 */
export async function getDownloadPresignedUrl(fileKey: string, originalFileName?: string) {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Cloudflare R2 is not fully configured in environment variables.");
  }

  const responseContentDisposition = originalFileName
    ? `attachment; filename="${encodeURIComponent(originalFileName)}"`
    : "attachment";

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ResponseContentDisposition: responseContentDisposition,
  });

  const downloadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  return downloadUrl;
}
