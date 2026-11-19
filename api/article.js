let webpush = null;
try {
  webpush = require('web-push');
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:contato@b4comenta.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
} catch (e) {
  console.warn('web-push indisponível:', e.message);
}

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const ARTICLES_KEY = 'b4comenta:articles';
const SUBS_KEY = 'b4comenta:push_subs';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:contato@b4comenta.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function redisCommand(command, ...args) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Variáveis do Upstash Redis não configuradas.');
  }
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

function isAuthorized(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
  return Boolean(adminPassword && token === adminPassword);
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const raw = await redisCommand('GET', ARTICLES_KEY);
      const articles = raw ? JSON.parse(raw) : [];
      return res.status(200).json(articles);
    }

    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const newArticle = {
        id: 'b4-' + Date.now(),
        title: String(body.title || '').trim(),
        excerpt: String(body.excerpt || '').trim(),
        category: String(body.category || 'Bahia').trim(),
        tag: String(body.category || 'Bahia').trim().toUpperCase(),
        image: String(body.image || '').trim(),
        body: String(body.body || '').trim(),
        date: new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Bahia' })
      };

      const rawArticles = await redisCommand('GET', ARTICLES_KEY);
      const articles = rawArticles ? JSON.parse(rawArticles) : [];
      const updated = [newArticle, ...articles];
      await redisCommand('SET', ARTICLES_KEY, JSON.stringify(updated));

      // Dispara Web Push para os inscritos
      const rawSubs = await redisCommand('GET', SUBS_KEY);
      const subs = rawSubs ? JSON.parse(rawSubs) : [];
      if (subs.length > 0 && process.env.VAPID_PUBLIC_KEY) {
        const payload = JSON.stringify({
          notification: {
            title: `B4 Comenta | ${newArticle.category}`,
            body: newArticle.title,
            icon: '/icons/icon-192x192.png',
            data: { url: '/' }
          }
        });

        const validSubs = [];
        await Promise.all(
          subs.map(async (sub) => {
            try {
              await webpush.sendNotification(sub, payload);
              validSubs.push(sub);
            } catch (err) {
              if (err.statusCode !== 404 && err.statusCode !== 410) {
                validSubs.push(sub);
              }
            }
          })
        );
        await redisCommand('SET', SUBS_KEY, JSON.stringify(validSubs));
      }

      return res.status(201).json(newArticle);
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id;
      const rawArticles = await redisCommand('GET', ARTICLES_KEY);
      const articles = rawArticles ? JSON.parse(rawArticles) : [];
      const updated = articles.filter((a) => a.id !== id);
      await redisCommand('SET', ARTICLES_KEY, JSON.stringify(updated));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro em /api/articles:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor.' });
  }
};