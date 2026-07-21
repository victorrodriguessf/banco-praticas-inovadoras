import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SubmissionPage from './pages/SubmissionPage';

import MinhasSubmissoesPage from './pages/MinhasSubmissoesPage';

// BASE_URL é '/' no dev e '/bancodepraticas/' no build de produção.
// Removemos a barra final para usar como basename do react-router.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/submissao" element={<SubmissionPage />} />
        <Route path="/minhas-submissoes" element={<MinhasSubmissoesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
