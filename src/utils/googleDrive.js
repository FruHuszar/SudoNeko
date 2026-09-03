const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'sudoneko-progress.json';

let tokenClient = null;
let accessToken = '';

function loadScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gis]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google sign-in did not load')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.dataset.gis = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google sign-in did not load'));
    document.head.appendChild(script);
  });
}

function requestToken() {
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if (response.error) reject(new Error(response.error));
        else resolve(response.access_token);
      }
    });
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
  });
}

async function api(path, options = {}) {
  const response = await fetch(`https://www.googleapis.com/${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, ...options.headers }
  });
  if (!response.ok) throw new Error(`Drive said no (${response.status})`);
  return response;
}

async function findFile() {
  const query = encodeURIComponent(`name='${FILE_NAME}'`);
  const response = await api(`drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name)`);
  const data = await response.json();
  return data.files?.[0]?.id || null;
}

async function readFile(id) {
  const response = await api(`drive/v3/files/${id}?alt=media`);
  return response.json();
}

async function writeFile(id, payload) {
  const body = JSON.stringify(payload);
  if (id) {
    await api(`upload/drive/v3/files/${id}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    return id;
  }
  const boundary = 'sudoneko-boundary';
  const metadata = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] });
  const multipart =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
  const response = await api('upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: multipart
  });
  const data = await response.json();
  return data.id;
}

export function driveConfigured() {
  return CLIENT_ID.length > 0;
}

export async function syncWithDrive(localState, merge) {
  if (!CLIENT_ID) throw new Error('Add VITE_GOOGLE_CLIENT_ID to enable saving');
  await loadScript();
  accessToken = await requestToken();
  const id = await findFile();
  let remote = null;
  if (id) {
    try {
      remote = await readFile(id);
    } catch {
      remote = null;
    }
  }
  const merged = merge(localState, remote);
  await writeFile(id, merged);
  return merged;
}
