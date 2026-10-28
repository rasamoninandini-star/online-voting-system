
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;

// Frontend folder location
const WEB_ROOT = path.join(__dirname, '..', 'frontend');

const MAX_BODY_SIZE = 16 * 1024;

const allowedCategories = new Set([
  'Community',
  'Local projects',
  'Education'
]);

// Sample elections are stored in memory.
// They reset whenever the server restarts.
const elections = [
  {
    id: 'community-council',
    name: 'Community Council Election',
    category: 'Community',
    status: 'open',
    closeDate: null
  },
  {
    id: 'park-priorities',
    name: 'Park Improvement Priorities',
    category: 'Local projects',
    status: 'open',
    closeDate: null
  },
  {
    id: 'student-representative',
    name: 'Student Representative Vote',
    category: 'Education',
    status: 'open',
    closeDate: null
  },
  {
    id: 'community-garden',
    name: 'Community Garden Planning',
    category: 'Community',
    status: 'upcoming',
    closeDate: null
  }
];

// Supported file types
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Send JSON responses
function sendJson(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });

  response.end(JSON.stringify(value));
}

// Read and parse JSON request bodies
function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    let tooLarge = false;

    request.setEncoding('utf8');

    request.on('data', (chunk) => {
      if (
        Buffer.byteLength(body) + Buffer.byteLength(chunk) >
        MAX_BODY_SIZE
      ) {
        tooLarge = true;
      } else if (!tooLarge) {
        body += chunk;
      }
    });

    request.on('end', () => {
      if (tooLarge) {
        reject(
          Object.assign(
            new Error('Request body is too large.'),
            { status: 413 }
          )
        );
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(
          Object.assign(
            new Error('Request body must be valid JSON.'),
            { status: 400 }
          )
        );
      }
    });

    request.on('error', reject);
  });
}

// Validate YYYY-MM-DD dates
function isValidDate(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// Serve HTML, CSS, JavaScript, and other frontend files
async function serveStatic(request, response, pathname) {
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendJson(response, 400, {
      error: 'Invalid URL path.'
    });
    return;
  }

  // Open index.html when the homepage is requested
  const relativePath =
    decodedPath === '/'
      ? 'index.html'
      : decodedPath.replace(/^\/+/, '');

  const filePath = path.resolve(WEB_ROOT, relativePath);

  // Prevent requests from accessing files outside the frontend folder
  if (
    filePath !== WEB_ROOT &&
    !filePath.startsWith(`${WEB_ROOT}${path.sep}`)
  ) {
    sendJson(response, 403, {
      error: 'Forbidden.'
    });
    return;
  }

  try {
    const file = await fs.promises.readFile(filePath);

    response.writeHead(200, {
      'Content-Type':
        contentTypes[path.extname(filePath).toLowerCase()] ||
        'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });

    if (request.method === 'HEAD') {
      response.end();
    } else {
      response.end(file);
    }
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') {
      sendJson(response, 404, {
        error: 'Not found.'
      });
    } else {
      console.error('File serving error:', error);

      sendJson(response, 500, {
        error: 'Unable to read the requested file.'
      });
    }
  }
}

// Create the HTTP server
const server = http.createServer(async (request, response) => {
  let url;

  try {
    url = new URL(
      request.url,
      `http://${request.headers.host || 'localhost'}`
    );
  } catch {
    sendJson(response, 400, {
      error: 'Invalid request URL.'
    });
    return;
  }

  // GET and POST: /api/elections
  if (url.pathname === '/api/elections') {
    if (request.method === 'GET') {
      sendJson(response, 200, elections);
      return;
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST');

      sendJson(response, 405, {
        error: 'Method not allowed.'
      });
      return;
    }

    // Require JSON for new elections
    if (
      !request.headers['content-type']
        ?.toLowerCase()
        .includes('application/json')
    ) {
      sendJson(response, 415, {
        error: 'Send election details as application/json.'
      });
      return;
    }

    try {
      const body = await readJson(request);

      const name =
        typeof body?.name === 'string'
          ? body.name.trim()
          : '';

      const category = body?.category;
      const closeDate = body?.closeDate;

      if (!name || name.length > 90) {
        sendJson(response, 400, {
          error: 'Name must be between 1 and 90 characters.'
        });
        return;
      }

      if (!allowedCategories.has(category)) {
        sendJson(response, 400, {
          error: 'Choose a valid election category.'
        });
        return;
      }

      if (!isValidDate(closeDate)) {
        sendJson(response, 400, {
          error:
            'Provide a valid closing date in YYYY-MM-DD format.'
        });
        return;
      }

      const today = new Date().toISOString().slice(0, 10);

      const election = {
        id: randomUUID(),
        name,
        category,
        closeDate,
        status: closeDate >= today ? 'open' : 'closed'
      };

      elections.push(election);

      sendJson(response, 201, election);
    } catch (error) {
      sendJson(response, error.status || 400, {
        error: error.message || 'Invalid request.'
      });
    }

    return;
  }

  // Handle unknown API endpoints
  if (url.pathname.startsWith('/api/')) {
    sendJson(response, 404, {
      error: 'API endpoint not found.'
    });
    return;
  }

  // Only allow GET and HEAD requests for frontend files
  if (
    request.method !== 'GET' &&
    request.method !== 'HEAD'
  ) {
    response.setHeader('Allow', 'GET, HEAD');

    sendJson(response, 405, {
      error: 'Method not allowed.'
    });
    return;
  }

  // Serve frontend files
  await serveStatic(request, response, url.pathname);
});

// Start the server
server.listen(PORT, () => {
  console.log('-------------------------------------');
  console.log('Online Voting and Polling System');
  console.log('-------------------------------------');
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Frontend folder: ${WEB_ROOT}`);
  console.log(`Homepage: http://localhost:${PORT}/`);
  console.log(
    `Elections API: http://localhost:${PORT}/api/elections`
  );
  console.log('-------------------------------------');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Stop the other server or choose another port.`
    );
  } else {
    console.error('Server error:', error);
  }
});
