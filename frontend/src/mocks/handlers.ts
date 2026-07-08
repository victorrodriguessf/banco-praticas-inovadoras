import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('http://localhost:3333/auth/login', async ({ request }) => {
    try {
      const data = await request.json() as any;
      
      // Mock validation matching the swagger example
      if (data.email === 'docente@senac.br' && data.senha === 'minhaSenha123') {
        return HttpResponse.json({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked.token',
          usuario: {
            id: '123456',
            nome: 'Docente Senac',
            email: 'docente@senac.br'
          }
        });
      }

      return HttpResponse.json({
        message: 'Credenciais inválidas'
      }, { status: 401 });
    } catch (e) {
      return HttpResponse.json({ message: 'Bad request' }, { status: 400 });
    }
  }),
];
