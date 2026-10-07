const KEY = 'qualifica-vix-citizen-session';
export function readCitizenSession(): string | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (saved?.token && Number(saved.expiresAt) > Date.now()) return saved.token;
    sessionStorage.removeItem(KEY);
  } catch { /* Browser storage may be unavailable. */ }
  return null;
}
export function saveCitizenSession(token: string, expiresAt = Date.now() + 900000) {
  try { sessionStorage.setItem(KEY, JSON.stringify({ token, expiresAt })); } catch { /* The current form can still use the in-memory session. */ }
}
