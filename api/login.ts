export async function POST(request: Request) {
    try {
      const body = await request.json().catch(() => ({}));
      const password = typeof body?.password === 'string' ? body.password.trim() : '';
      const adminPassword = process.env['ADMIN_PASSWORD']?.trim();
  
      if (!adminPassword) {
        return Response.json(
          { error: 'ADMIN_PASSWORD não configurada no servidor.' },
          { status: 500 }
        );
      }
  
      if (password && password === adminPassword) {
        return Response.json({ ok: true, token: adminPassword }, { status: 200 });
      }
  
      return Response.json({ error: 'Senha inválida.' }, { status: 401 });
    } catch {
      return Response.json(
        { error: 'Erro ao ler o corpo da requisição.' },
        { status: 400 }
      );
    }
  }