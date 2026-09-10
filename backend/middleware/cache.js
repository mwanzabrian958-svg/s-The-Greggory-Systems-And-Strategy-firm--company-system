/**
 * In-memory response cache for read-heavy GET endpoints.
 *
 * Usage (route level):
 *   router.get('/', cache(60), async (req, res) => { ... });
 *
 * Invalidate after writes:
 *   cache.invalidate('/api/blog-articles');   // prefix match
 *   cache.clear();                            // nuke everything
 *
 * Responses are cached by `method + originalUrl`, stored with the status code,
 * and served with an `X-Cache: HIT/MISS` header so callers can observe it.
 * Because cached payloads are JSON-serializable at request time, this is safe
 * to use with any handler that calls `res.json(...)`.
 */

const store = new Map();

const cache =
  (ttlSeconds = 60) =>
  (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = req.originalUrl || req.url;
    const hit = store.get(key);

    if (hit && hit.expires > Date.now()) {
      return res.status(hit.status).set('X-Cache', 'HIT').json(hit.body);
    }
    if (hit) store.delete(key);

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      store.set(key, {
        status: res.statusCode,
        body,
        expires: Date.now() + ttlSeconds * 1000,
      });
      res.set('X-Cache', 'MISS');
      return originalJson(body);
    };
    next();
  };

cache.invalidate = (prefix) => {
  for (const key of [...store.keys()]) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

cache.clear = () => store.clear();

module.exports = cache;
