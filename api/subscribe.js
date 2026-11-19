const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();
const SUBS_KEY = 'b4comenta:push_subs';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const subscription = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Inscrição inválida.' });
    }

    const subs = (await redis.get(SUBS_KEY)) || [];
    const exists = subs.some((s) => s.endpoint === subscription.endpoint);

    if (!exists) {
      subs.push(subscription);
      await redis.set(SUBS_KEY, subs);
    }

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Erro em /api/subscribe:', error);
    return res.status(500).json({ error: 'Erro ao salvar inscrição.' });
  }
};