import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../services/storage';

const BUCKET = 'praticas-uploads';
const PUBLIC_BASE_URL = 'http://localhost:9000';

export const uploadArquivo = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Nenhum arquivo enviado' });
      return;
    }

    const chave = `${randomUUID()}-${file.originalname}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: chave,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    res.status(201).json({ url: `${PUBLIC_BASE_URL}/${BUCKET}/${chave}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor ao enviar arquivo' });
  }
};
