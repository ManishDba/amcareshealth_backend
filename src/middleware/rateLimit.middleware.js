const rateLimitStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.startTime > entry.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests. Please try again later.',
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    let entry = rateLimitStore.get(key);

    if (!entry || now - entry.startTime > windowMs) {
      entry = { count: 1, startTime: now, windowMs };
      rateLimitStore.set(key, entry);
      return next();
    }

    entry.count++;
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.set('X-RateLimit-Reset', String(Math.ceil((entry.startTime + windowMs) / 1000)));

    if (entry.count > max) {
      return res.status(429).json({
        success: false,
        message,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    next();
  };
};

const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts. Please try again after 15 minutes.' });
const apiRateLimit = rateLimit({ windowMs: 60 * 1000, max: 60 });

module.exports = { rateLimit, authRateLimit, apiRateLimit };
