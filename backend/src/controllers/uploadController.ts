import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../services/storage';

const BUCKET = 'banco-de-praticas';
const PUBLIC_BASE_URL = 'http://localhost:9000';

// Apenas imagens rasterizadas: não executam script (ao contrário de SVG/HTML),
// o que elimina o vetor de XSS armazenado mesmo com o bucket público.
export const MIMES_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EXTENSAO_POR_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Valida o conteúdo real do arquivo pelos "magic bytes", não confiando no MIME declarado.
function detectarMimePorConteudo(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  // GIF: "GIF87a" ou "GIF89a"
  if (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a') {
    return 'image/gif';
  }
  // WEBP: "RIFF"...."WEBP"
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

export const uploadArquivo = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Nenhum arquivo enviado' });
      return;
    }

    const mimeReal = detectarMimePorConteudo(file.buffer);

    // O conteúdo precisa ser realmente uma imagem permitida e bater com o MIME declarado.
    if (!mimeReal || !MIMES_PERMITIDOS.includes(mimeReal) || mimeReal !== file.mimetype) {
      res.status(400).json({ message: 'Arquivo inválido: envie uma imagem JPG, PNG, WEBP ou GIF' });
      return;
    }

    // Nome de objeto controlado pelo servidor (ignora o nome original, evitando
    // injeção de extensão/caminho): UUID + extensão derivada do tipo detectado.
    const chave = `${randomUUID()}${EXTENSAO_POR_MIME[mimeReal] ?? extname(file.originalname)}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: chave,
        Body: file.buffer,
        // ContentType fixado a partir do conteúdo detectado (não do MIME enviado pelo cliente).
        // Como só imagens rasterizadas passam pela whitelist, exibir inline é seguro (não executam script).
        ContentType: mimeReal,
      })
    );

    res.status(201).json({ url: `${PUBLIC_BASE_URL}/${BUCKET}/${chave}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor ao enviar arquivo' });
  }
};
