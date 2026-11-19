const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const SUBS_KEY = 'b4comenta:push_subs';

async function redisCommand(command, ...args) {
  const response = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([command, ...args])
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const subscription = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Inscrição inválida.' });
    }

    const rawSubs = await redisCommand('GET', SUBS_KEY);
    const subs = rawSubs ? JSON.parse(rawSubs) : [];
    const exists = subs.some((s) => s.endpoint === subscription.endpoint);

    if (!exists) {
      subs.push(subscription);
      await redisCommand('SET', SUBS_KEY, JSON.stringify(subs));
    }

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Erro em /api/subscribe:', error);
    return res.status(500).json({ error: error.message || 'Erro ao salvar inscrição.' });
  }
};