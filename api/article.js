const { Redis } = require('@upstash/redis');
const webpush = require('web-push');

const redis = Redis.fromEnv();
const ARTICLES_KEY = 'b4comenta:articles';
const SUBS_KEY = 'b4comenta:push_subs';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:contato@b4comenta.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
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
      const articles = (await redis.get(ARTICLES_KEY)) || [];
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

      const articles = (await redis.get(ARTICLES_KEY)) || [];
      const updated = [newArticle, ...articles];
      await redis.set(ARTICLES_KEY, updated);

      const subs = (await redis.get(SUBS_KEY)) || [];
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
              // Remove inscrições expiradas/canceladas (404 ou 410)
              if (err.statusCode !== 404 && err.statusCode !== 410) {
                validSubs.push(sub);
              }
            }
          })
        );
        await redis.set(SUBS_KEY, validSubs);
      }

      return res.status(201).json(newArticle);
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id;
      const articles = (await redis.get(ARTICLES_KEY)) || [];
      const updated = articles.filter((a) => a.id !== id);
      await redis.set(ARTICLES_KEY, updated);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro em /api/articles:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};