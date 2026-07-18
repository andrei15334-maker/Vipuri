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

// Elemente Gestiune Aplicații
const applicationsTab = document.getElementById('applicationsTab');
const applicationsTableBody = document.getElementById('applicationsTableBody');
const appLogsTableBody = document.getElementById('appLogsTableBody');
const appDetailModal = document.getElementById('appDetailModal');
const closeAppDetailBtn = document.getElementById('closeAppDetailBtn');
const detailAppTitle = document.getElementById('detailAppTitle');
const detailAppContent = document.getElementById('detailAppContent');
const detailAppActions = document.getElementById('detailAppActions');

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
    const validRoles = ['admin', 'manager', 'tester-pd', 'tester-smurd', 'tester-staff', 'manager-mafii'];
    if (!validRoles.includes(currentUser.role)) {
      showToast("Acces interzis. Nu faci parte din staff.", "error");
      setTimeout(() => window.location.href = '/', 1500);
      return;
    }

    // Setare Badge Rol
    let roleText = 'Staff';
    if (currentUser.role === 'manager') roleText = 'Manager Staff';
    else if (currentUser.role === 'admin') roleText = 'Admin';
    else if (currentUser.role === 'tester-pd') roleText = 'Tester PD';
    else if (currentUser.role === 'tester-smurd') roleText = 'Tester SMURD';
    else if (currentUser.role === 'tester-staff') roleText = 'Tester Staff';
    else if (currentUser.role === 'manager-mafii') roleText = 'Manager Mafii';
    roleBadge.textContent = roleText;
    
    // Afișare tab-uri vizibile pentru tot staff-ul
    logsTab.style.display = 'inline-block';
    
    const questionsTabBtn = document.getElementById('questionsTab');
    if (questionsTabBtn) {
      questionsTabBtn.style.display = 'inline-block';
    }
    
    // Configurare vizibilitate taburi bazat pe rol
    const editorTabBtn = document.querySelector('[data-target="editorPanel"]');
    const isTester = ['tester-pd', 'tester-smurd', 'tester-staff', 'manager-mafii'].includes(currentUser.role);
    
    // Restricționare selector întrebări pentru testeri
    const questionFormSelect = document.getElementById('questionFormSelect');
    if (questionFormSelect) {
      if (currentUser.role === 'tester-pd') {
        questionFormSelect.value = 'police';
        questionFormSelect.disabled = true;
      } else if (currentUser.role === 'tester-smurd') {
        questionFormSelect.value = 'smurd';
        questionFormSelect.disabled = true;
      } else if (currentUser.role === 'tester-staff') {
        questionFormSelect.value = 'staff';
        questionFormSelect.disabled = true;
      } else if (currentUser.role === 'manager-mafii') {
        questionFormSelect.value = 'gang';
        questionFormSelect.disabled = true;
      } else {
        questionFormSelect.disabled = false;
      }
    }

    if (isTester) {
      // Ascunde editorul pentru testeri
      if (editorTabBtn) editorTabBtn.style.display = 'none';
      
      // Activează tab-ul de aplicații implicit
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      applicationsTab.classList.add('active');
      
      document.querySelectorAll('.admin-tab-panel').forEach(panel => panel.classList.remove('active'));
      document.getElementById('applicationsPanel').classList.add('active');
      
      // Încarcă panoul de aplicații
      loadApplicationsPanel();
    } else {
      // Pentru manager sau admin de regulamente
      if (editorTabBtn) editorTabBtn.style.display = 'inline-block';
      // Încărcare date regulamente pentru editor
      await fetchRulesData();
      loadCategoryContent();
    }

    // Afișare tab Manager dacă este manager staff (manager sau admin)
    const isManagerStaff = ['manager', 'admin'].includes(currentUser.role);
    if (isManagerStaff) {
      managerTab.style.display = 'inline-block';
      loadPendingUsers();
      loadActiveStaff();
      
      const rulesManagerControls = document.getElementById('rulesManagerControls');
      if (rulesManagerControls) rulesManagerControls.style.display = 'flex';
    }

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
    } else if (target === 'applicationsPanel') {
      loadApplicationsPanel();
    } else if (target === 'questionsPanel') {
      loadQuestionsEditor();
    }
  });

  // Selector Categorie Editor
  editCategorySelect.addEventListener('change', () => {
    loadCategoryContent();
  });

  // Live Editor Typing
  ruleTextEditor.addEventListener('input', () => {
    updateLivePreview();
    saveRuleBtn.disabled = false;
  });

  // Salvare Regulament
  saveRuleBtn.addEventListener('click', async () => {
    const content = ruleTextEditor.value;
    const { category } = currentSelectedRule;

    if (!category) return;

    try {
      saveRuleBtn.disabled = true;
      saveRuleBtn.textContent = 'Se salvează...';
      
      const response = await fetch('/api/rules/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryKey: category,
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

  // Gestiune Întrebări Event Listeners
  const questionFormSelect = document.getElementById('questionFormSelect');
  if (questionFormSelect) {
    questionFormSelect.addEventListener('change', () => {
      loadQuestionsEditor();
    });
  }

  const addQuestionBtn = document.getElementById('addQuestionBtn');
  if (addQuestionBtn) {
    addQuestionBtn.addEventListener('click', () => {
      addNewQuestionRow();
    });
  }

  const saveQuestionsBtn = document.getElementById('saveQuestionsBtn');
  if (saveQuestionsBtn) {
    saveQuestionsBtn.addEventListener('click', () => {
      saveQuestions();
    });
  }

  // Setup pentru modalul de detalii aplicație și butoane de toggle
  setupApplicationsTabEventListeners();
}

// ==========================================
// EDITOR MANAGEMENT
// ==========================================
function loadCategoryContent() {
  const categoryKey = editCategorySelect.value;
  
  // Resetează editor
  ruleTextEditor.value = '';
  ruleTextEditor.disabled = true;
  editorLivePreview.innerHTML = '<span style="color: var(--text-dark);">Alege o categorie pentru a edita.</span>';
  editorTitleDisplay.textContent = 'Selectează o categorie pentru a edita';
  saveRuleBtn.disabled = true;

  if (!rulesData || !rulesData[categoryKey]) return;

  const category = rulesData[categoryKey];
  currentSelectedRule = { category: categoryKey };
  
  editorTitleDisplay.textContent = category.title;
  ruleTextEditor.value = category.content || '';
  ruleTextEditor.disabled = false;
  
  updateLivePreview();
  saveRuleBtn.disabled = true;
}

function updateLivePreview() {
  const text = ruleTextEditor.value.trim();
  if (!text) {
    editorLivePreview.innerHTML = '<span style="color: var(--text-dark);">Niciun conținut de previzualizat.</span>';
    return;
  }

  editorLivePreview.innerHTML = '';
  const lines = text.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      const spacer = document.createElement('div');
      spacer.style.height = '1rem';
      editorLivePreview.appendChild(spacer);
      return;
    }

    if (trimmed.startsWith('### ')) {
      const h2 = document.createElement('h2');
      h2.className = 'chapter-title';
      h2.style.cssText = `
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: 1.8rem;
        color: var(--text-light);
        margin-top: 2.5rem;
        margin-bottom: 1.25rem;
        border-bottom: 2px solid var(--primary);
        padding-bottom: 0.5rem;
      `;
      h2.textContent = trimmed.substring(4);
      editorLivePreview.appendChild(h2);
    } else if (trimmed.startsWith('#### ')) {
      const h3 = document.createElement('h3');
      h3.className = 'subchapter-title';
      h3.style.cssText = `
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        font-size: 1.3rem;
        color: var(--primary);
        margin-top: 1.75rem;
        margin-bottom: 0.85rem;
      `;
      h3.textContent = trimmed.substring(5);
      editorLivePreview.appendChild(h3);
    } else {
      const pEl = document.createElement('p');
      pEl.style.cssText = `
        margin-bottom: 0.85rem;
        font-size: 1.02rem;
        line-height: 1.65;
        color: var(--text-normal);
      `;
      pEl.innerHTML = formatRuleText(trimmed);
      editorLivePreview.appendChild(pEl);
    }
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
  escaped = escaped.replace(/[\s\-–—|+:]*Amenda\s+([0-9.,]+)\$/gi, (match, p1) => {
    badges.push(`<span class="badge badge-fine">💵 Amendă: ${p1}$</span>`);
    return '';
  });

  // 2. Extrage Sentințele (Închisoare)
  escaped = escaped.replace(/[\s\-–—|+:]*Sentință\s+([0-9.]+)\s+Luni/gi, (match, p1) => {
    badges.push(`<span class="badge badge-jail">🔒 Închisoare: ${p1} Luni</span>`);
    return '';
  });

  // 3. Extrage Check Points
  escaped = escaped.replace(/[\s\-–—|+:]*([0-9.]+)\s+Check\s+Points/gi, (match, p1) => {
    badges.push(`<span class="badge badge-cp">📍 ${p1} CP</span>`);
    return '';
  });

  // 4. Extrage Avertismentele (Warn)
  escaped = escaped.replace(/[\s\-–—|+:]*([0-9.]+)\s+Warn/gi, (match, p1) => {
    // Add (În funcție de gravitate) inline before/after Warn badge
    badges.push(`
      <span style="display: inline-flex; align-items: center; gap: 4px; vertical-align: middle;">
        <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 500; font-family: inherit;">(În funcție de gravitate)</span>
        <span class="badge badge-warn">⚠️ ${p1} Warn</span>
      </span>
    `);
    return '';
  });

  // 5. Extrage Ban
  escaped = escaped.replace(/[\s\-–—|+:]*Ban\s+Temporar/gi, () => {
    badges.push(`<span class="badge badge-ban-temp">🚫 Ban Temporar</span>`);
    return '';
  });

  escaped = escaped.replace(/[\s\-–—|+:]*Ban\s+Permanent/gi, () => {
    badges.push(`<span class="badge badge-ban">🚫 Ban Permanent</span>`);
    return '';
  });

  // Curăță delimitatorii și spațiile suplimentare rămase doar de la început/sfârșit
  let cleanText = escaped.trim()
    .replace(/\s*[|:\–\-+]+$/g, '')
    .replace(/^[|:\–\-+]+\s*/g, '')
    .trim();

  cleanText = cleanText.replace(/\s+/g, ' ');

  if (badges.length > 0) {
    return `<span class="rule-text">${cleanText}</span><span class="rule-badges" style="display: inline-flex; gap: 0.5rem; align-items: center; margin-left: 8px; vertical-align: middle; flex-wrap: wrap;">${badges.join('')}</span>`;
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

function getFriendlyRoleName(role) {
  if (role === 'manager') return 'Manager Staff';
  if (role === 'admin') return 'Admin';
  if (role === 'tester-pd') return 'Tester PD';
  if (role === 'tester-smurd') return 'Tester SMURD';
  if (role === 'tester-staff') return 'Tester Staff';
  if (role === 'manager-mafii') return 'Manager Mafii';
  return role;
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
      <td><span style="color: ${user.role === 'manager' ? 'var(--primary)' : 'var(--accent-blue)'}; font-weight: 700; text-transform: uppercase; font-size: 0.8rem;">${getFriendlyRoleName(user.role)}</span></td>
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
        <select class="form-select role-select" data-user="${user.username}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; width: 140px;" ${isSelf ? 'disabled' : ''}>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
          <option value="tester-pd" ${user.role === 'tester-pd' ? 'selected' : ''}>Tester PD</option>
          <option value="tester-smurd" ${user.role === 'tester-smurd' ? 'selected' : ''}>Tester SMURD</option>
          <option value="tester-staff" ${user.role === 'tester-staff' ? 'selected' : ''}>Tester Staff</option>
          <option value="manager-mafii" ${user.role === 'manager-mafii' ? 'selected' : ''}>Manager Mafii</option>
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

// ==========================================
// SECTIUNE GESTIUNE APLICATII (ADMIN)
// ==========================================
let currentApplicationsList = [];
let currentAppStatuses = { police: true, smurd: true, staff: true, gang: true };

function setupApplicationsTabEventListeners() {
  const types = ['smurd', 'police', 'staff', 'gang'];
  types.forEach(type => {
    const btn = document.getElementById(`toggleBtn-${type}`);
    if (btn) {
      btn.addEventListener('click', () => {
        const currentIsOpen = currentAppStatuses[type];
        toggleAppStatus(type, currentIsOpen);
      });
    }
  });

  if (closeAppDetailBtn) {
    closeAppDetailBtn.addEventListener('click', () => {
      appDetailModal.classList.remove('active');
    });
  }
}

async function loadApplicationsPanel() {
  await loadAppStatuses();
  await loadPendingApplications();
  await loadApplicationLogs();
}

async function loadAppStatuses() {
  try {
    const response = await fetch('/api/applications/status');
    const data = await response.json();
    if (data.success && data.status) {
      currentAppStatuses = data.status;
      const types = ['smurd', 'police', 'staff', 'gang'];
      types.forEach(type => {
        const isOpen = currentAppStatuses[type];
        const badge = document.getElementById(`statusBadge-${type}`);
        const btn = document.getElementById(`toggleBtn-${type}`);

        if (badge) {
          badge.textContent = isOpen ? "DESCHISE" : "ÎNCHISE";
          badge.className = isOpen ? "badge badge-fine" : "badge badge-warn";
        }

        if (btn) {
          btn.textContent = isOpen ? "Oprește (STOP)" : "Pornește (START)";
          btn.className = isOpen ? "action-badge-btn delete" : "action-badge-btn approve";
          
          // Permisiuni buton toggle (doar Testeri dedicati sau Admin/Manager)
          const hasAccess = canProcessAppType(currentUser.role, type);
          btn.disabled = !hasAccess;
          if (!hasAccess) {
            btn.style.opacity = '0.3';
            btn.style.cursor = 'not-allowed';
          } else {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
          }
        }
      });
    }
  } catch (error) {
    console.error("Eroare incarcare status aplicatii:", error);
  }
}

async function toggleAppStatus(type, currentIsOpen) {
  try {
    const response = await fetch('/api/admin/applications/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, isOpen: !currentIsOpen })
    });
    const data = await response.json();
    if (data.success) {
      showToast(`Aplicațiile pentru ${type.toUpperCase()} au fost ${!currentIsOpen ? 'deschise' : 'închise'}.`, "success");
      loadAppStatuses();
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Eroare la schimbarea statusului aplicațiilor.", "error");
  }
}

async function loadPendingApplications() {
  try {
    const response = await fetch('/api/admin/applications');
    const data = await response.json();
    if (data.success && data.applications) {
      currentApplicationsList = data.applications;
      renderApplicationsTable(data.applications);
    }
  } catch (error) {
    showToast("Eroare la încărcarea aplicațiilor.", "error");
  }
}

function renderApplicationsTable(apps) {
  applicationsTableBody.innerHTML = '';
  
  // Filtrare aplicatii pe baza rolului
  const filteredApps = apps.filter(app => {
    if (currentUser.role === 'manager' || currentUser.role === 'admin') return true;
    if (currentUser.role === 'tester-pd' && app.type === 'police') return true;
    if (currentUser.role === 'tester-smurd' && app.type === 'smurd') return true;
    if (currentUser.role === 'tester-staff' && app.type === 'staff') return true;
    if (currentUser.role === 'manager-mafii' && app.type === 'gang') return true;
    return false;
  });

  // Arată doar cele "pending" în acest tabel principal
  const pendingApps = filteredApps.filter(app => app.status === 'pending');

  if (pendingApps.length === 0) {
    applicationsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-dark); padding: 2rem;">Nicio aplicație în așteptare pentru specializarea ta.</td></tr>';
    return;
  }

  pendingApps.forEach(app => {
    const tr = document.createElement('tr');
    
    // Nume candidat
    let candidateName = "Jucător";
    const type = app.type;
    const formData = app.formData;
    if (type === 'police' && formData.numeOoc) candidateName = formData.numeOoc;
    else if (type === 'smurd' && formData.idJoc) candidateName = `ID: ${formData.idJoc}`;
    else if (type === 'staff' && formData.numeVarsta) candidateName = formData.numeVarsta;
    else if (type === 'gang' && formData.numeOoc) candidateName = formData.numeOoc;

    const dateStr = new Date(app.submittedAt).toLocaleDateString('ro-RO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let friendlyType = '';
    if (type === 'smurd') friendlyType = 'SMURD';
    else if (type === 'police') friendlyType = 'Poliție';
    else if (type === 'staff') friendlyType = 'Staff';
    else if (type === 'gang') friendlyType = 'Gang/Mafie';

    tr.innerHTML = `
      <td><strong style="color: var(--text-light);">${friendlyType}</strong></td>
      <td>${candidateName}</td>
      <td style="color: var(--text-dark);">${dateStr}</td>
      <td><span class="badge badge-warn">ÎN CURS</span></td>
      <td style="text-align: right;">
        <button class="action-badge-btn info" data-id="${app.id}">Vizualizează</button>
      </td>
    `;

    tr.querySelector('.info').addEventListener('click', () => {
      viewApplicationDetails(app.id);
    });

    applicationsTableBody.appendChild(tr);
  });
}

function viewApplicationDetails(appId) {
  const app = currentApplicationsList.find(a => a.id === appId);
  if (!app) return;

  const type = app.type;
  const formData = app.formData || {};
  
  let friendlyType = '';
  if (type === 'smurd') friendlyType = 'SMURD';
  else if (type === 'police') friendlyType = 'Poliție';
  else if (type === 'staff') friendlyType = 'Staff';
  else if (type === 'gang') friendlyType = 'Gang/Mafie';

  detailAppTitle.textContent = `Aplicație ${friendlyType} - Detalii Completate`;
  detailAppContent.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Se încarcă detaliile aplicației...</div>';

  // Verificare permisiuni procesare aplicatie
  const isPending = app.status === 'pending';
  const hasProcessingAccess = canProcessAppType(currentUser.role, type);

  detailAppActions.innerHTML = '';
  if (isPending && hasProcessingAccess) {
    detailAppActions.innerHTML = `
      <button class="action-badge-btn delete" id="btnRejectApp" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">Respinge Aplicația</button>
      <button class="action-badge-btn approve" id="btnAcceptApp" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">Acceptă Aplicația</button>
    `;

    document.getElementById('btnAcceptApp').addEventListener('click', () => {
      if (confirm(`Sigur dorești să ACCEPȚI această aplicație?`)) {
        processApp(appId, 'accepted');
      }
    });

    document.getElementById('btnRejectApp').addEventListener('click', () => {
      const reason = prompt("Te rugăm să introduci MOTIVUL RESPINGERII:");
      if (reason === null) return;
      if (!reason.trim()) {
        showToast("Trebuie să specifici un motiv pentru respingere!", "error");
        return;
      }
      processApp(appId, 'rejected', reason.trim());
    });
  } else {
    detailAppActions.innerHTML = `
      <span style="color: var(--text-dark); font-size: 0.85rem; font-style: italic;">
        ${!isPending ? `Procesată deja de ${app.processedByName || app.processedBy}` : 'Nu ai drepturi pentru a aproba/respinge această categorie.'}
      </span>
    `;
  }

  appDetailModal.classList.add('active');

  // Preia întrebările în timp real de pe server
  fetch(`/api/applications/questions?type=${type}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.questions) {
        const questions = data.questions;
        let detailsHtml = '<div style="display: flex; flex-direction: column; gap: 1.25rem;">';

        questions.forEach((q) => {
          const answerVal = formData[q.id];
          const displayVal = answerVal !== undefined && answerVal !== '' ? answerVal : '<span style="font-style: italic; color: var(--text-dark);">Fără răspuns</span>';

          if (q.type === 'file') {
            detailsHtml += `
              <div class="detail-field">
                <strong style="color: var(--primary); display: block; margin-bottom: 0.5rem;">${q.label}</strong>
                <div style="text-align: center; margin-top: 0.5rem;">
                  ${answerVal ? `<img src="${answerVal}" style="max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid var(--border-light); box-shadow: var(--shadow-neon);"/>` : '<span style="font-style:italic; color:var(--text-dark);">Fără imagine.</span>'}
                </div>
              </div>
            `;
          } else if (q.type === 'textarea') {
            detailsHtml += `
              <div class="detail-field">
                <strong style="color: var(--primary); display: block; margin-bottom: 0.25rem;">${q.label}</strong>
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-light); padding: 0.75rem 1rem; border-radius: 6px; color: var(--text-light); line-height: 1.5; white-space: pre-wrap;">${displayVal}</div>
              </div>
            `;
          } else {
            detailsHtml += `
              <div class="detail-field">
                <strong style="color: var(--primary);">${q.label}:</strong>
                <span style="color: var(--text-light); margin-left: 0.5rem;">${displayVal}</span>
              </div>
            `;
          }
        });

        detailsHtml += '</div>';
        detailAppContent.innerHTML = detailsHtml;
      } else {
        detailAppContent.innerHTML = '<div style="color: var(--primary); padding: 1rem; text-align: center;">Eroare la încărcarea structurii întrebărilor.</div>';
      }
    })
    .catch(err => {
      console.error(err);
      detailAppContent.innerHTML = '<div style="color: var(--primary); padding: 1rem; text-align: center;">Eroare de rețea la încărcarea structurii.</div>';
    });
}

async function processApp(appId, status, reason = '') {
  try {
    const response = await fetch('/api/admin/applications/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, status, reason })
    });
    const data = await response.json();
    if (data.success) {
      showToast(`Aplicația a fost ${status === 'accepted' ? 'acceptată' : 'respinsă'} cu succes!`, "success");
      appDetailModal.classList.remove('active');
      loadApplicationsPanel();
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Eroare la procesarea aplicației.", "error");
  }
}

async function loadApplicationLogs() {
  try {
    const response = await fetch('/api/admin/applications/logs');
    const data = await response.json();
    if (data.success && data.logs) {
      renderApplicationLogsTable(data.logs);
    }
  } catch (error) {
    console.error("Eroare loguri aplicatii:", error);
  }
}

function renderApplicationLogsTable(logs) {
  appLogsTableBody.innerHTML = '';
  
  // Filtrare loguri pe baza rolului
  const filteredLogs = logs.filter(log => {
    if (currentUser.role === 'manager' || currentUser.role === 'admin') return true;
    if (currentUser.role === 'tester-pd' && log.appType === 'police') return true;
    if (currentUser.role === 'tester-smurd' && log.appType === 'smurd') return true;
    if (currentUser.role === 'tester-staff' && log.appType === 'staff') return true;
    if (currentUser.role === 'manager-mafii' && log.appType === 'gang') return true;
    return false;
  });

  const processedLogs = filteredLogs.filter(log => log.status !== 'pending');

  if (processedLogs.length === 0) {
    appLogsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-dark); padding: 2rem;">Nicio decizie înregistrată încă.</td></tr>';
    return;
  }

  processedLogs.forEach(log => {
    const tr = document.createElement('tr');
    const date = new Date(log.timestamp);
    const dateStr = date.toLocaleString('ro-RO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let friendlyType = '';
    if (log.appType === 'smurd') friendlyType = 'SMURD';
    else if (log.appType === 'police') friendlyType = 'Poliție';
    else if (log.appType === 'staff') friendlyType = 'Staff';
    else if (log.appType === 'gang') friendlyType = 'Gang/Mafie';

    const statusBadge = log.status === 'accepted' 
      ? '<span class="badge badge-fine">ACCEPTAT</span>' 
      : '<span class="badge badge-warn">RESPINS</span>';

    tr.innerHTML = `
      <td style="color: var(--text-dark);">${dateStr}</td>
      <td><strong style="color: var(--text-light);">${friendlyType}</strong></td>
      <td>${log.applicantName}</td>
      <td>${statusBadge}</td>
      <td><strong style="color: var(--text-light);">${log.processedBy}</strong></td>
      <td style="color: var(--text-muted); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">
        ${log.reason || ''}
      </td>
    `;
    appLogsTableBody.appendChild(tr);
  });
}

function canProcessAppType(userRole, appType) {
  if (userRole === 'manager' || userRole === 'admin') return true;
  if (userRole === 'tester-pd' && appType === 'police') return true;
  if (userRole === 'tester-smurd' && appType === 'smurd') return true;
  if (userRole === 'tester-staff' && appType === 'staff') return true;
  if (userRole === 'manager-mafii' && appType === 'gang') return true;
  return false;
}

// ==========================================
// SECTIUNE GESTIUNE ÎNTREBĂRI FORMULARE
// ==========================================
let currentQuestionsList = [];

async function loadQuestionsEditor() {
  const type = document.getElementById('questionFormSelect').value;
  const container = document.getElementById('questionsListContainer');
  container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Se încarcă întrebările...</div>';

  try {
    const response = await fetch(`/api/applications/questions?type=${type}`);
    const data = await response.json();
    
    if (data.success && data.questions) {
      currentQuestionsList = data.questions;
      renderQuestionsList();
    } else {
      showToast(data.message || "Eroare la încărcarea întrebărilor.", "error");
    }
  } catch (error) {
    showToast("Eroare de rețea la încărcarea întrebărilor.", "error");
  }
}

function renderQuestionsList() {
  const container = document.getElementById('questionsListContainer');
  container.innerHTML = '';

  if (currentQuestionsList.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Nicio întrebare definită. Adaugă una folosind butonul de mai jos.</div>';
    return;
  }

  currentQuestionsList.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.index = index;

    // Generăm elementul de opțiuni dacă e tip radio
    let optionsHtml = '';
    if (q.type === 'radio') {
      const optsStr = (q.options || []).join(', ');
      optionsHtml = `
        <div class="form-group" style="grid-column: span 3; margin-top: 0.5rem;">
          <label class="form-label" style="font-size: 0.8rem;">Opțiuni Radio (separate prin virgulă)</label>
          <input type="text" class="form-input q-options" value="${optsStr}" placeholder="Ex: DA, NU, POATE">
        </div>
      `;
    }

    card.innerHTML = `
      <div class="question-card-header">
        <span class="question-index-badge">Întrebarea #${index + 1}</span>
        <div class="question-card-actions">
          <button class="action-badge-btn" onclick="moveQuestion(${index}, -1)" ${index === 0 ? 'disabled' : ''} style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">▲ Sus</button>
          <button class="action-badge-btn" onclick="moveQuestion(${index}, 1)" ${index === currentQuestionsList.length - 1 ? 'disabled' : ''} style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">▼ Jos</button>
          <button class="action-badge-btn reject" onclick="deleteQuestion(${index})" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">❌ Șterge</button>
        </div>
      </div>
      <div class="question-card-body">
        <div class="form-group">
          <label class="form-label" style="font-size: 0.8rem;">Text Întrebare (Label)</label>
          <input type="text" class="form-input q-label" value="${q.label || ''}" required placeholder="Ex: Câți ani ai?">
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size: 0.8rem;">Tip Câmp</label>
          <select class="form-select q-type" onchange="onQuestionTypeChange(${index}, this.value)" style="padding: 0.45rem;">
            <option value="text" ${q.type === 'text' ? 'selected' : ''}>Text Scurt</option>
            <option value="number" ${q.type === 'number' ? 'selected' : ''}>Număr (Cifre)</option>
            <option value="textarea" ${q.type === 'textarea' ? 'selected' : ''}>Text Lung</option>
            <option value="radio" ${q.type === 'radio' ? 'selected' : ''}>Butoane Radio (Alegere)</option>
            <option value="file" ${q.type === 'file' ? 'selected' : ''}>Încărcare Poză / Fișier</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size: 0.8rem;">Placeholder / Sugestie</label>
          <input type="text" class="form-input q-placeholder" value="${q.placeholder || ''}" placeholder="Ex: Scrie vârsta reală">
        </div>
        ${optionsHtml}
      </div>
    `;

    container.appendChild(card);
  });
}

function onQuestionTypeChange(index, newType) {
  syncQuestionsStateFromDOM();
  currentQuestionsList[index].type = newType;
  if (newType === 'radio' && (!currentQuestionsList[index].options || currentQuestionsList[index].options.length === 0)) {
    currentQuestionsList[index].options = ["DA", "NU"];
  }
  renderQuestionsList();
}

function addNewQuestionRow() {
  syncQuestionsStateFromDOM();
  const newId = `q_dyn_${Date.now()}`;
  currentQuestionsList.push({
    id: newId,
    type: 'text',
    label: 'Întrebare nouă',
    required: true,
    placeholder: ''
  });
  renderQuestionsList();
  showToast("Întrebare adăugată la sfârșitul listei.", "success");
}

function deleteQuestion(index) {
  syncQuestionsStateFromDOM();
  currentQuestionsList.splice(index, 1);
  renderQuestionsList();
  showToast("Întrebare ștearsă.", "info");
}

function moveQuestion(index, direction) {
  syncQuestionsStateFromDOM();
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= currentQuestionsList.length) return;

  const temp = currentQuestionsList[index];
  currentQuestionsList[index] = currentQuestionsList[targetIndex];
  currentQuestionsList[targetIndex] = temp;

  renderQuestionsList();
}

function syncQuestionsStateFromDOM() {
  const cards = document.querySelectorAll('#questionsListContainer .question-card');
  cards.forEach(card => {
    const idx = parseInt(card.dataset.index, 10);
    if (isNaN(idx) || !currentQuestionsList[idx]) return;

    const labelInput = card.querySelector('.q-label');
    const placeholderInput = card.querySelector('.q-placeholder');
    const typeSelect = card.querySelector('.q-type');

    if (labelInput) currentQuestionsList[idx].label = labelInput.value;
    if (placeholderInput) currentQuestionsList[idx].placeholder = placeholderInput.value;
    if (typeSelect) currentQuestionsList[idx].type = typeSelect.value;

    if (currentQuestionsList[idx].type === 'radio') {
      const optionsInput = card.querySelector('.q-options');
      if (optionsInput) {
        currentQuestionsList[idx].options = optionsInput.value
          .split(',')
          .map(opt => opt.trim())
          .filter(opt => opt.length > 0);
      }
    }
  });
}

async function saveQuestions() {
  syncQuestionsStateFromDOM();
  const type = document.getElementById('questionFormSelect').value;
  const saveBtn = document.getElementById('saveQuestionsBtn');

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Se salvează...';

    const response = await fetch('/api/admin/questions/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        questions: currentQuestionsList
      })
    });

    const data = await response.json();
    if (data.success) {
      showToast("Toate întrebările au fost salvate cu succes!", "success");
      loadQuestionsEditor();
    } else {
      showToast(data.message || "Eroare la salvarea întrebărilor.", "error");
    }
  } catch (err) {
    showToast("Eroare de rețea la salvarea întrebărilor.", "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Salvează Toate Întrebările';
  }
}
