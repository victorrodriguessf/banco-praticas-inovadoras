import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { login, registerRequest, registerVerify, forgotPasswordRequest, forgotPasswordReset } from '../controllers/authController';
import { getEditaisAtivos } from '../controllers/editalController';
import { createSubmissao, getMinhasSubmissoes } from '../controllers/submissaoController';
import { uploadArquivo, MIMES_PERMITIDOS } from '../controllers/uploadController';
import { authMiddleware } from '../middlewares/auth';
import { authLimiter, emailLimiter } from '../middlewares/rateLimit';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB por arquivo
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // Primeira barreira (rápida) pelo MIME declarado; o conteúdo real é validado
    // por magic bytes no controller.
    if (MIMES_PERMITIDOS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  },
});

router.post('/auth/login', authLimiter, login);
router.post('/auth/register/request', emailLimiter, registerRequest);
router.post('/auth/register/verify', authLimiter, registerVerify);
router.post('/auth/forgot-password/request', emailLimiter, forgotPasswordRequest);
router.post('/auth/forgot-password/reset', authLimiter, forgotPasswordReset);

router.get('/editais/ativos', getEditaisAtivos);

// Traduz erros do multer (tamanho excedido, tipo rejeitado) em respostas 400 limpas.
const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
  upload.single('arquivo')(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Arquivo excede o tamanho máximo de 5 MB' : 'Falha no upload do arquivo';
      res.status(400).json({ message: msg });
      return;
    }
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
      return;
    }
    next();
  });
};

router.post('/upload', authMiddleware, uploadSingle, uploadArquivo);
router.post('/submissoes', authMiddleware, createSubmissao);
router.get('/submissoes/minhas', authMiddleware, getMinhasSubmissoes);

export default router;
