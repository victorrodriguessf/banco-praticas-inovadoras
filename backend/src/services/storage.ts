import { S3Client } from "@aws-sdk/client-s3";

function requireEnv(nome: string): string {
  const valor = process.env[nome];
  if (!valor || valor.trim() === "") {
    throw new Error(`Variável de ambiente obrigatória ausente: ${nome}`);
  }
  return valor;
}

export const s3Client = new S3Client({
  region: "us-east-1", // Exigido pelo S3, irrelevante para MinIO local
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  forcePathStyle: true, // Crucial para o MinIO
  credentials: {
    // Sem fallback embutido: as credenciais precisam vir do ambiente.
    accessKeyId: requireEnv("MINIO_ROOT_USER"),
    secretAccessKey: requireEnv("MINIO_ROOT_PASSWORD"),
  },
});
