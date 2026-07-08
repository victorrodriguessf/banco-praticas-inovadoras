import { Router } from 'express';
import { login } from '../controllers/authController';
import { getEditaisAtivos } from '../controllers/editalController';
import { createSubmissao } from '../controllers/submissaoController';

const router = Router();

router.post('/auth/login', login);
router.get('/editais/ativos', getEditaisAtivos);
router.post('/submissoes', createSubmissao); // Futuramente adicionar middleware de auth aqui

export default router;
