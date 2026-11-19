import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { password } = req.body || {};
  const adminPassword = process.env['ADMIN_PASSWORD'];

  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD não configurada no servidor.' });
  }

  if (password === adminPassword) {
    // Retorna um token de sessão (pode ser usado no header Authorization depois)
    return res.status(200).json({ ok: true, token: adminPassword });
  }

  return res.status(401).json({ error: 'Senha incorreta.' });
}