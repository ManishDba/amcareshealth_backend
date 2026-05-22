const axios = require('axios');

const defaultPort = process.env.PORT || 5000;
const HEALTH_URL = process.env.HEALTH_URL || `http://localhost:${defaultPort}/health`;
const INTERVAL_MS = parseInt(process.env.PING_INTERVAL_MS, 10) || 5 * 60 * 1000; // default 5 minutes

console.log(`Pinger starting. Target: ${HEALTH_URL} — interval: ${INTERVAL_MS}ms`);

async function ping() {
  try {
    const start = Date.now();
    const res = await axios.get(HEALTH_URL, { timeout: 5000 });
    const elapsed = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ping ok — status=${res.status} time=${elapsed}ms`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ping failed:`, err.message || err);
    if (err.code === 'ECONNREFUSED') {
      console.error('Connection refused — is the server running? Try `npm start` or verify PORT/HEALTH_URL env vars.');
    }
  }
}

// Run immediately then on interval
ping();
setInterval(ping, INTERVAL_MS);
