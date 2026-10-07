import { getAuth, inMemoryPersistence, setPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseApp } from '../lib/firebase';

const form = document.getElementById('loginForm') as HTMLFormElement;
const status = document.getElementById('statusMsg') as HTMLDivElement;
const button = document.getElementById('submitBtn') as HTMLButtonElement;
const email = document.getElementById('username') as HTMLInputElement;
const password = document.getElementById('password') as HTMLInputElement;
const auth = getAuth(firebaseApp);
let submitting = false;

const show = (message: string, type = 'info') => {
  status.textContent = message;
  status.className = `status ${type}`;
};

const bounded = async <T>(promise: Promise<T>): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('A conexão demorou mais que o esperado. Tente novamente.')), 20000);
    })]);
  } finally { clearTimeout(timer); }
};

const messages: Record<string, string> = {
  'auth/invalid-credential': 'Confira o e-mail e a senha e tente novamente.',
  'auth/user-not-found': 'Confira o e-mail e a senha e tente novamente.',
  'auth/wrong-password': 'Confira o e-mail e a senha e tente novamente.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/user-disabled': 'Esta conta foi desativada. Procure o administrador.',
  'auth/operation-not-allowed': 'O acesso está indisponível. Tente novamente mais tarde.',
  'auth/configuration-not-found': 'O acesso está indisponível. Tente novamente mais tarde.',
  'auth/too-many-requests': 'Muitas tentativas de acesso. Aguarde um pouco e tente novamente.',
  'auth/network-request-failed': 'Não foi possível conectar. Confira sua conexão e tente novamente.',
};

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting) return;
  submitting = true;
  button.disabled = true;
  show('Entrando…');
  try {
    await setPersistence(auth, inMemoryPersistence);
    const credential = await bounded(signInWithEmailAndPassword(auth, email.value.trim(), password.value));
    const idToken = await bounded(credential.user.getIdToken());
    const response = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }), signal: AbortSignal.timeout(15000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível iniciar a sessão administrativa.');
    show('Acesso liberado. Abrindo o painel…', 'success');
    window.location.replace('/admin/menu.html');
  } catch (error) {
    const failure = error as Error & { code?: string };
    show(messages[failure.code || ''] || (['AbortError', 'TimeoutError'].includes(failure.name) ? 'A conexão demorou mais que o esperado. Tente novamente.' : failure.code ? 'Não foi possível entrar. Tente novamente mais tarde.' : failure.message || 'Não foi possível entrar.'), 'error');
  } finally {
    password.value = '';
    await signOut(auth).catch(() => {});
    submitting = false;
    button.disabled = false;
  }
});

fetch('/api/admin/me', { signal: AbortSignal.timeout(10000) })
  .then(response => { if (response.ok && !submitting) window.location.replace('/admin/menu.html'); })
  .catch(() => {});
