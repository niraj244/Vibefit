// Pathao Nepal Courier API service
// Uses OAuth2 password grant — credentials stay server-side only.
// Set PATHAO_TRACKING_ENDPOINT from Pathao developer docs to enable live status.

let cachedToken = null;
let tokenExpiresAt = 0;

async function getPathaoToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

  const { PATHAO_BASE_URL, PATHAO_CLIENT_ID, PATHAO_CLIENT_SECRET, PATHAO_USERNAME, PATHAO_PASSWORD, PATHAO_GRANT_TYPE } = process.env;

  if (!PATHAO_BASE_URL || !PATHAO_CLIENT_ID || !PATHAO_CLIENT_SECRET || !PATHAO_USERNAME || !PATHAO_PASSWORD) {
    throw new Error('Pathao credentials not fully configured in environment variables.');
  }

  const res = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: PATHAO_CLIENT_ID,
      client_secret: PATHAO_CLIENT_SECRET,
      username: PATHAO_USERNAME,
      password: PATHAO_PASSWORD,
      grant_type: PATHAO_GRANT_TYPE || 'password',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pathao token request failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  console.log('[Pathao] Access token refreshed successfully.');
  return cachedToken;
}

async function getPathaoTracking(consignmentId) {
  const endpoint = process.env.PATHAO_TRACKING_ENDPOINT;

  if (!endpoint) {
    console.warn('[Pathao] PATHAO_TRACKING_ENDPOINT is not configured. Add the Pathao Nepal tracking/status endpoint from developer docs.');
    return { configured: false };
  }

  const token = await getPathaoToken();

  // Support :consignmentId placeholder or plain base URL (will append)
  const url = endpoint.includes(':consignmentId')
    ? endpoint.replace(':consignmentId', encodeURIComponent(consignmentId))
    : `${endpoint.replace(/\/$/, '')}/${encodeURIComponent(consignmentId)}`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pathao tracking request failed (${res.status}): ${err}`);
  }

  return { configured: true, ...(await res.json()) };
}

export { getPathaoTracking };
