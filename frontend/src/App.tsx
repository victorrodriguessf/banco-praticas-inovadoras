import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SubmissionPage from './pages/SubmissionPage';

import MinhasSubmissoesPage from './pages/MinhasSubmissoesPage';

export default function App() {
  return (
    <BrowserRouter>
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
