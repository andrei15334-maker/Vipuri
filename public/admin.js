// VIPURI ROLEPLAY - Front-End Logic pentru Panoul Administrativ Staff
let rulesData = null;
let currentUser = null;
let currentSelectedRule = {
  category: '',
  chapterId: '',
  subchapterId: ''
};

// Elemente DOM
const roleBadge = document.getElementById('roleBadge');
const logoutBtn = document.getElementById('logoutBtn');
const adminTabs = document.getElementById('adminTabs');
const managerTab = document.getElementById('managerTab');
const logsTab = document.getElementById('logsTab');
const logsTableBody = document.getElementById('logsTableBody');
const toastContainer = document.getElementById('toastContainer');

// Editor DOM
const editCategorySelect = document.getElementById('editCategorySelect');
const editChapterSelect = document.getElementById('editChapterSelect');
const editSubchapterSelect = document.getElementById('editSubchapterSelect');
const editorTitleDisplay = document.getElementById('editorTitleDisplay');
const saveRuleBtn = document.getElementById('saveRuleBtn');
const ruleTextEditor = document.getElementById('ruleTextEditor');
const editorLivePreview = document.getElementById('editorLivePreview');

// Manager DOM
const pendingCountBadge = document.getElementById('pendingCountBadge');
const pendingUsersTableBody = document.getElementById('pendingUsersTableBody');
const activeUsersTableBody = document.getElementById('activeUsersTableBody');

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  } else if (type === 'error') {
    icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  } else {
    icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;

  toastContainer.appendChild(toast);

  const timeoutId = setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 5000);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timeoutId);
    toast.remove();
  });
}

// ==========================================
// INITIALIZARE & VERIFICARE SESIUNE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuthAndInit();
  setupEventListeners();
});

async function checkAuthAndInit() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();

    if (!data.authenticated) {
      showToast("Sesiune expirată sau neautorizată. Redirecționare...", "error");
      setTimeout(() => window.location.href = '/', 1500);
      return;
    }

    currentUser = data.user;
    
    // Verificare rol
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      showToast("Acces interzis. Nu faci parte din staff.", "error");
      setTimeout(() => window.location.href = '/', 1500);
      return;
    }

    // Setare Badge Rol
    roleBadge.textContent = currentUser.role === 'manager' ? 'Manager Staff' : 'Admin';
    
    // Afișare tab Logs pentru tot staff-ul
    logsTab.style.display = 'inline-block';
    
    // Afișare tab Manager dacă este cazul
    if (currentUser.role === 'manager') {
      managerTab.style.display = 'inline-block';
      loadPendingUsers();
      loadActiveStaff();
    }

    // Încărcare date regulamente pentru editor
    await fetchRulesData();
    populateChapters();

  } catch (error) {
    showToast("Eroare la verificarea conexiunii cu serverul.", "error");
  }
}

async function fetchRulesData() {
  try {
    const response = await fetch('/api/rules');
    rulesData = await response.json();
  } catch (error) {
    showToast("Eroare la încărcarea datelor regulamentului.", "error");
  }
}

// ==========================================
// EVENTS SETUP
// ==========================================
function setupEventListeners() {
  // Deconectare
  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        showToast("Te-ai deconectat cu succes.", "success");
        setTimeout(() => window.location.href = '/', 1000);
      }
    } catch (e) {
      showToast("Eroare la deconectare.", "error");
    }
  });

  // Schimbare Tab-uri Admin
  adminTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-tab-btn');
    if (!btn) return;

    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const target = btn.dataset.target;
    document.querySelectorAll('.admin-tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(target).classList.add('active');

    if (target === 'managerPanel') {
      loadPendingUsers();
      loadActiveStaff();
    } else if (target === 'logsPanel') {
      loadLogs();
    }
  });

  // Selector Categorie Editor
  editCategorySelect.addEventListener('change', () => {
    populateChapters();
  });

  // Selector Capitol Editor
  editChapterSelect.addEventListener('change', () => {
    populateSubchapters();
  });

  // Selector Subcapitol Editor
  editSubchapterSelect.addEventListener('change', () => {
    loadSubchapterContent();
  });

  // Live Editor Typing
  ruleTextEditor.addEventListener('input', () => {
    updateLivePreview();
    saveRuleBtn.disabled = false;
  });

  // Salvare Regulament
  saveRuleBtn.addEventListener('click', async () => {
    const content = ruleTextEditor.value;
    const { category, chapterId, subchapterId } = currentSelectedRule;

    if (!category || !chapterId || !subchapterId) return;

    try {
      saveRuleBtn.disabled = true;
      saveRuleBtn.textContent = 'Se salvează...';
      
      const response = await fetch('/api/rules/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryKey: category,
          chapterId,
          subchapterId,
          content
        })
      });

      const data = await response.json();
      if (data.success) {
        showToast("Modificările au fost salvate cu succes!", "success");
        await fetchRulesData(); // reîncarcă datele
      } else {
        showToast(data.message, "error");
      }
    } catch (e) {
      showToast("Eroare la salvarea regulamentului.", "error");
    } finally {
      saveRuleBtn.disabled = true;
      saveRuleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Salvează Modificările
      `;
    }
  });
}

// ==========================================
// EDITOR MANAGEMENT
// ==========================================
function populateChapters() {
  const categoryKey = editCategorySelect.value;
  editChapterSelect.innerHTML = '<option value="" disabled selected>-- Alege Capitol --</option>';
  editSubchapterSelect.innerHTML = '<option value="" disabled selected>-- Alege Subcapitol --</option>';
  
  // Resetează editor
  ruleTextEditor.value = '';
  ruleTextEditor.disabled = true;
  editorLivePreview.innerHTML = '<span style="color: var(--text-dark);">Alege capitol și subcapitol pentru previzualizare.</span>';
  editorTitleDisplay.textContent = 'Selectează un subcapitol pentru a edita';
  saveRuleBtn.disabled = true;

  if (!rulesData || !rulesData[categoryKey]) return;

  const chapters = rulesData[categoryKey].chapters;
  chapters.forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch.id;
    opt.textContent = ch.title;
    editChapterSelect.appendChild(opt);
  });
}

function populateSubchapters() {
  const categoryKey = editCategorySelect.value;
  const chapterId = editChapterSelect.value;
  editSubchapterSelect.innerHTML = '<option value="" disabled selected>-- Alege Subcapitol --</option>';

  ruleTextEditor.value = '';
  ruleTextEditor.disabled = true;
  editorLivePreview.innerHTML = '<span style="color: var(--text-dark);">Alege subcapitol pentru previzualizare.</span>';
  editorTitleDisplay.textContent = 'Selectează un subcapitol';
  saveRuleBtn.disabled = true;

  if (!rulesData || !rulesData[categoryKey] || !chapterId) return;

  const chapter = rulesData[categoryKey].chapters.find(c => c.id === chapterId);
  if (!chapter) return;

  chapter.subchapters.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub.id;
    opt.textContent = sub.title;
    editSubchapterSelect.appendChild(opt);
  });
}

function loadSubchapterContent() {
  const categoryKey = editCategorySelect.value;
  const chapterId = editChapterSelect.value;
  const subchapterId = editSubchapterSelect.value;

  if (!rulesData || !categoryKey || !chapterId || !subchapterId) return;

  const chapter = rulesData[categoryKey].chapters.find(c => c.id === chapterId);
  const subchapter = chapter.subchapters.find(s => s.id === subchapterId);

  if (subchapter) {
    currentSelectedRule = { category: categoryKey, chapterId, subchapterId };
    
    editorTitleDisplay.textContent = subchapter.title;
    ruleTextEditor.value = subchapter.content;
    ruleTextEditor.disabled = false;
    
    updateLivePreview();
    saveRuleBtn.disabled = true; // activat doar la modificări (input)
  }
}

function updateLivePreview() {
  const text = ruleTextEditor.value.trim();
  if (!text) {
    editorLivePreview.innerHTML = '<span style="color: var(--text-dark);">Niciun conținut de previzualizat.</span>';
    return;
  }

  // Conversie simplă text în paragrafe HTML cu badge-uri
  const paragraphs = text.split('\n').filter(p => p.trim() !== '');
  editorLivePreview.innerHTML = '';
  paragraphs.forEach(p => {
    const pEl = document.createElement('p');
    pEl.style.marginBottom = '0.75rem';
    pEl.innerHTML = formatRuleText(p);
    editorLivePreview.appendChild(pEl);
  });
}

function formatRuleText(text) {
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  let badges = [];

  // 1. Extrage Amenzile
  escaped = escaped.replace(/Amenda\s+([0-9.,]+)\$/gi, (match, p1) => {
    badges.push(`<span class="badge badge-fine">💵 Amendă: ${p1}$</span>`);
    return '';
  });

  // 2. Extrage Sentințele (Închisoare)
  escaped = escaped.replace(/Sentință\s+([0-9.]+)\s+Luni/gi, (match, p1) => {
    badges.push(`<span class="badge badge-jail">🔒 Închisoare: ${p1} Luni</span>`);
    return '';
  });

  // 3. Extrage Check Points
  escaped = escaped.replace(/([0-9.]+)\s+Check\s+Points/gi, (match, p1) => {
    badges.push(`<span class="badge badge-cp">📍 ${p1} CP</span>`);
    return '';
  });

  // 4. Extrage Avertismentele (Warn)
  escaped = escaped.replace(/([0-9.]+)\s+Warn/gi, (match, p1) => {
    badges.push(`<span class="badge badge-warn">⚠️ ${p1} Warn</span>`);
    return '';
  });

  // 5. Extrage Mute minute
  escaped = escaped.replace(/([0-9.]+)\s+minute/gi, (match, p1) => {
    badges.push(`<span class="badge badge-jail">🔇 ${p1} Min Mute</span>`);
    return '';
  });

  // 6. Extrage Ban
  escaped = escaped.replace(/Ban\s+Permanent/gi, () => {
    badges.push(`<span class="badge badge-ban">🚫 Ban Permanent</span>`);
    return '';
  });

  // Curăță delimitatorii și spațiile suplimentare rămase
  let cleanText = escaped
    .replace(/\s*[|:\–\-+]\s*$/g, '')
    .replace(/^[|:\–\-+]\s*/g, '')
    .replace(/\s*[|:\–\-+]+\s*[|:\–\-+]*\s*/g, ' ')
    .trim();

  cleanText = cleanText.replace(/\s+/g, ' ');

  if (badges.length > 0) {
    return `<span class="rule-text">${cleanText}</span><span class="rule-badges">${badges.join('')}</span>`;
  } else {
    return `<span class="rule-text">${cleanText}</span>`;
  }
}

// ==========================================
// MANAGER PANEL MANAGEMENT (CERERI STAFF)
// ==========================================
async function loadPendingUsers() {
  try {
    const response = await fetch('/api/admin/users/pending');
    const data = await response.json();

    if (data.success) {
      renderPendingUsers(data.users);
    }
  } catch (error) {
    console.error("Eroare încărcare utilizatori pending:", error);
  }
}

function renderPendingUsers(users) {
  pendingCountBadge.textContent = users.length;
  if (users.length === 0) {
    pendingCountBadge.style.display = 'none';
    pendingUsersTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-dark); padding: 2rem;">Nu există cereri de înregistrare în așteptare.</td>
      </tr>
    `;
    return;
  }

  pendingCountBadge.style.display = 'inline-block';
  pendingUsersTableBody.innerHTML = '';
  
  users.forEach(user => {
    const tr = document.createElement('tr');
    
    const dateStr = new Date(user.createdAt).toLocaleDateString('ro-RO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    tr.innerHTML = `
      <td><strong>${user.username}</strong></td>
      <td>${user.fullName}</td>
      <td><code>${user.discordId}</code></td>
      <td><span style="color: ${user.role === 'manager' ? 'var(--primary)' : 'var(--accent-blue)'}; font-weight: 700; text-transform: uppercase; font-size: 0.8rem;">${user.role}</span></td>
      <td>${dateStr}</td>
      <td style="text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
        <button class="action-badge-btn approve" data-user="${user.username}">Aprobă</button>
        <button class="action-badge-btn reject" data-user="${user.username}">Respinge</button>
      </td>
    `;

    // Evenimente pe butoanele de acțiune
    tr.querySelector('.approve').addEventListener('click', () => handleApproveUser(user.username));
    tr.querySelector('.reject').addEventListener('click', () => handleRejectUser(user.username));

    pendingUsersTableBody.appendChild(tr);
  });
}

async function handleApproveUser(username) {
  if (!confirm(`Sigur dorești să aprobi utilizatorul "${username}" ca membru staff?`)) return;

  try {
    const response = await fetch('/api/admin/users/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    if (data.success) {
      showToast(`Utilizatorul ${username} a fost aprobat!`, "success");
      loadPendingUsers();
      loadActiveStaff();
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Eroare la aprobarea utilizatorului.", "error");
  }
}

async function handleRejectUser(username) {
  if (!confirm(`Sigur dorești să respingi cererea utilizatorului "${username}"? Contul va fi șters permanent.`)) return;

  try {
    const response = await fetch('/api/admin/users/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    if (data.success) {
      showToast(`Cererea utilizatorului ${username} a fost ștearsă.`, "info");
      loadPendingUsers();
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Eroare la respingerea utilizatorului.", "error");
  }
}

// ==========================================
// MANAGER PANEL MANAGEMENT (STAFF ACTIV)
// ==========================================
async function loadActiveStaff() {
  try {
    const response = await fetch('/api/admin/users/list');
    const data = await response.json();

    if (data.success) {
      renderActiveStaff(data.users);
    }
  } catch (error) {
    console.error("Eroare încărcare staff activ:", error);
  }
}

function renderActiveStaff(users) {
  activeUsersTableBody.innerHTML = '';
  
  if (users.length === 0) {
    activeUsersTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-dark);">Eroare. Nu există membri activi.</td>
      </tr>
    `;
    return;
  }

  users.forEach(user => {
    const tr = document.createElement('tr');
    
    const dateStr = new Date(user.createdAt).toLocaleDateString('ro-RO', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const isSelf = user.username.toLowerCase() === currentUser.username.toLowerCase();

    tr.innerHTML = `
      <td><strong>${user.username} ${isSelf ? '<span style="font-weight: normal; color: var(--text-dark);">(Tu)</span>' : ''}</strong></td>
      <td>${user.fullName}</td>
      <td><code>${user.discordId}</code></td>
      <td>
        <select class="form-select role-select" data-user="${user.username}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; width: 120px;" ${isSelf ? 'disabled' : ''}>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
        </select>
      </td>
      <td>${dateStr}</td>
      <td style="text-align: right;">
        <button class="action-badge-btn delete" data-user="${user.username}" ${isSelf ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>Șterge Cont</button>
      </td>
    `;

    // Schimbare rol staff
    if (!isSelf) {
      tr.querySelector('.role-select').addEventListener('change', (e) => {
        handleUpdateRole(user.username, e.target.value);
      });
      tr.querySelector('.delete').addEventListener('click', () => {
        handleDeleteStaff(user.username);
      });
    }

    activeUsersTableBody.appendChild(tr);
  });
}

async function handleUpdateRole(username, newRole) {
  try {
    const response = await fetch('/api/admin/users/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, newRole })
    });
    
    const data = await response.json();
    if (data.success) {
      showToast(`Gradul lui ${username} a fost schimbat în ${newRole}!`, "success");
      loadActiveStaff();
    } else {
      showToast(data.message, "error");
      loadActiveStaff(); // resetează dropdown-ul la starea inițială
    }
  } catch (error) {
    showToast("Eroare la modificarea rolului.", "error");
  }
}

async function handleDeleteStaff(username) {
  if (!confirm(`⚠️ ATENȚIE!\n\nSigur dorești să elimini complet accesul utilizatorului "${username}"?\nAcesta nu se va mai putea conecta pe site.`)) return;

  try {
    const response = await fetch('/api/admin/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    if (data.success) {
      showToast(`Membru staff ${username} eliminat cu succes.`, "info");
      loadActiveStaff();
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Eroare la eliminarea utilizatorului staff.", "error");
  }
}

async function loadLogs() {
  try {
    const response = await fetch('/api/admin/logs');
    const data = await response.json();
    if (data.success) {
      renderLogs(data.logs);
    }
  } catch (error) {
    showToast("Eroare la încărcarea logurilor.", "error");
  }
}

function renderLogs(logs) {
  logsTableBody.innerHTML = '';
  if (logs.length === 0) {
    logsTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-dark); padding: 2rem;">Nicio activitate înregistrată.</td></tr>';
    return;
  }

  logs.forEach(log => {
    const tr = document.createElement('tr');
    
    // Format timestamp in Romanian locale
    const date = new Date(log.timestamp);
    const dateStr = date.toLocaleString('ro-RO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    tr.innerHTML = `
      <td style="color: var(--text-dark);">${dateStr}</td>
      <td>
        <strong style="color: var(--text-light);">${log.fullName}</strong> 
        <span style="font-size: 0.75rem; color: var(--primary);">(@${log.username})</span>
      </td>
      <td style="color: var(--text-muted); font-size: 0.85rem;">${log.action}</td>
    `;
    logsTableBody.appendChild(tr);
  });
}
