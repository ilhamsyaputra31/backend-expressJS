// pastikan ada satu sumber kebenaran token
window.getAuthToken = function () {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
};

window.API = '/api';

function setToken(token) { localStorage.setItem('token', token); } // login() akan set ke localStorage dulu
function getTokenRaw()   { return localStorage.getItem('token'); } // hanya untuk internal

window.logout = function () {
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
  location.href = '/login';
};

window.login = async function (email, password) {
  const r = await fetch(`${window.API}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  const j = await r.json();
  if (!r.ok) return { ok:false, ...j };
  setToken(j.token); // sementara simpan di localStorage
  return { ok:true };
};

window.register = async function register(name, email, password) {
  const r = await fetch(`${window.API}/auth/register`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ name, email, password })
  });
  const j = await r.json();
  return r.ok ? { ok:true, data:j } : { ok:false, ...j };
};

window.me = async function () {
  const token = window.getAuthToken();           // <-- GUNAKAN INI
  if (!token) return null;
  const r = await fetch(`${window.API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) return null;
  return r.json();
};
