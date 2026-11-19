module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const password = body?.password ? String(body.password).trim() : '';
  const adminPassword = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD).trim() : '';

  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD não configurada.' });
  }

  if (password && password === adminPassword) {
    return res.status(200).json({ ok: true, token: adminPassword });
  }

  return res.status(401).json({ error: 'Senha inválida.' });
};