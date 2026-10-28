function sendJson(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(value));
}

async function authMiddleware(request, response, next) {
  const authorization = request.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    sendJson(response, 401, { error: 'Authentication required.' });
    return;
  }

  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    sendJson(response, 503, { error: 'Authentication service is not configured.' });
    return;
  }

  try {
    const authResponse = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${match[1]}`
      }
    });

    if (!authResponse.ok) {
      sendJson(response, 401, { error: 'Invalid or expired access token.' });
      return;
    }

    request.user = await authResponse.json();
    await next();
  } catch {
    if (!response.headersSent) {
      sendJson(response, 503, { error: 'Unable to verify access token.' });
    }
  }
}

module.exports = { authMiddleware };
