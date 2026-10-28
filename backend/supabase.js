const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getConfig() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment.');
  }
  return { url: SUPABASE_URL, key: SUPABASE_SERVICE_ROLE_KEY };
}

async function requestElections(path, options = {}) {
  const { url, key } = getConfig();
  const response = await fetch(`${url}/rest/v1/elections${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const responseText = await response.text();
  let result;
  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    result = responseText;
  }

  if (!response.ok) {
    const message = result?.message || result?.error || 'Supabase request failed.';
    throw new Error(message);
  }
  return result;
}

function formatElection(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    status: row.status,
    closeDate: row.close_date
  };
}

async function listElections() {
  const rows = await requestElections('?select=*&order=close_date.asc');
  return rows.map(formatElection);
}

async function createElection({ name, category, closeDate, status }) {
  const rows = await requestElections('', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      name,
      category,
      close_date: closeDate,
      status
    })
  });
  return formatElection(rows[0]);
}

module.exports = { listElections, createElection };
