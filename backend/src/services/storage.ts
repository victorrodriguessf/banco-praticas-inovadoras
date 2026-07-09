import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "us-east-1", // Exigido pelo S3, irrelevante para MinIO local
  endpoint: "http://localhost:9000",
  forcePathStyle: true, // Crucial para o MinIO
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || "admin",
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "admin123",
  },
});
