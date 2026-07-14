import { Router } from 'express';
import multer from 'multer';
import { login, registerRequest, registerVerify } from '../controllers/authController';
import { getEditaisAtivos } from '../controllers/editalController';
import { createSubmissao } from '../controllers/submissaoController';
import { uploadArquivo } from '../controllers/uploadController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/auth/login', login);
router.post('/auth/register/request', registerRequest);
router.post('/auth/register/verify', registerVerify);

router.get('/editais/ativos', getEditaisAtivos);

router.post('/upload', authMiddleware, upload.single('arquivo'), uploadArquivo);
router.post('/submissoes', authMiddleware, createSubmissao);

export default router;
