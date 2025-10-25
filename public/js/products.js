;(function(){
  const API = window.API || '/api';
  let editingId = null;

  (async function init(){
    if (!window.getAuthToken()) return location.href = '/login';   // <-- pakai helper

    const u = await window.me();
    const elInfo = document.getElementById('userInfo');
    if (u && elInfo) elInfo.textContent = `${u.name} (${u.email})`;

    // ...bind handlers...

    await loadProducts();
  })();

  function authHeader(){
    const t = window.getAuthToken();                 // <-- pakai helper
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  async function loadProducts(){
    // ...
    const r = await fetch(`${API}/products?...`, {
      headers: { ...authHeader() }                   // <-- pakai helper
    });
    // ...
  }

  // fungsi lain tak berubah, pastikan setiap fetch pakai authHeader()
})();
