// VIPURI ROLEPLAY - Front-End Logic pentru Portalul Public
let allRulesData = null;
let currentCategory = 'general';
let currentUser = null;
let scrollspyObserver = null;

// Elemente DOM
const categoriesNav = document.getElementById('categoriesNav');
const chaptersList = document.getElementById('chaptersList');
const rulesContainer = document.getElementById('rulesContainer');
const headerActions = document.getElementById('headerActions');
const openAuthBtn = document.getElementById('openAuthBtn');
const authModal = document.getElementById('authModal');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const modalTabs = document.querySelector('.modal-tabs');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const rulesSearch = document.getElementById('rulesSearch');
const searchResults = document.getElementById('searchResults');
const toastContainer = document.getElementById('toastContainer');
const tocSidebar = document.getElementById('tocSidebar');
const tocList = document.getElementById('tocList');

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Iconițe specifice
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

  // Auto-închidere după 5 secunde
  const timeoutId = setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 5000);

  // Buton închidere manuală
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timeoutId);
    toast.remove();
  });
}

// ==========================================
// INITIALIZARE & SESIUNE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  loadRules();

  // Scrollspy & Scroll event pe header
  window.addEventListener('scroll', () => {
    const header = document.getElementById('mainHeader');
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Shortcut căutare (Ctrl+K sau Cmd+K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      rulesSearch.focus();
    }
  });
});

async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    if (data.authenticated) {
      currentUser = data.user;
      renderUserWidget();
    } else {
      currentUser = null;
      renderLoginButton();
    }
  } catch (error) {
    console.error("Eroare verificare sesiune:", error);
  }
}

function renderUserWidget() {
  const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  headerActions.innerHTML = `
    <div class="user-profile-widget">
      <div class="user-avatar">${initials}</div>
      <div class="user-info">
        <span class="user-name">${currentUser.fullName}</span>
        <span class="user-role-badge">${currentUser.role}</span>
      </div>
    </div>
    <a href="/admin.html" class="btn-primary" style="text-decoration: none; font-size: 0.85rem; padding: 0.5rem 1rem;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      Panou Control
    </a>
  `;
}

function renderLoginButton() {
  headerActions.innerHTML = `
    <button class="btn-primary" id="openAuthBtn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
      Conectare
    </button>
  `;
  document.getElementById('openAuthBtn').addEventListener('click', () => openModal());
}

// ==========================================
// REGULAMENTE LOADING & RENDERING
// ==========================================
async function loadRules() {
  try {
    const response = await fetch('/api/rules');
    allRulesData = await response.json();
    
    // Generare interfață pentru categoria curentă
    switchCategory(currentCategory);
  } catch (error) {
    console.error("Eroare încărcare regulamente:", error);
    rulesContainer.innerHTML = `
      <div class="rules-empty-state">
        <h3 style="color: var(--primary);">Eroare de conexiune</h3>
        <p>Nu s-au putut încărca regulamentele de pe server. Te rugăm să reîncerci.</p>
      </div>
    `;
  }
}

// Switch Category Tab
categoriesNav.addEventListener('click', (e) => {
  const tab = e.target.closest('.category-tab');
  if (!tab) return;

  document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');

  const category = tab.dataset.category;
  switchCategory(category);
});

function switchCategory(categoryKey) {
  currentCategory = categoryKey;
  
  if (categoryKey === 'applications') {
    renderApplicationsSidebar();
    loadAndRenderApplicationForm('smurd'); // implicit încarcă SMURD
    return;
  }

  if (!allRulesData || !allRulesData[categoryKey]) return;

  const categoryData = allRulesData[categoryKey];
  
  // 1. Randează Sidebar
  renderSidebar(categoryData);

  // 2. Randează Textul Regulamentului
  renderRulesText(categoryData);
}

function renderSidebar(categoryData) {
  chaptersList.innerHTML = '';
}

function renderRulesText(categoryData) {
  rulesContainer.innerHTML = '';

  const mainDiv = document.createElement('div');
  mainDiv.className = 'rules-full-content';
  mainDiv.style.cssText = `
    background: var(--bg-surface-solid);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  `;

  if (!categoryData.content || categoryData.content.trim() === '') {
    rulesContainer.innerHTML = `
      <div class="rules-empty-state">
        <h3>Regulament gol</h3>
        <p>Acest regulament nu are conținut adăugat încă.</p>
      </div>
    `;
    updateTOC([]);
    return;
  }

  // Parse lines to render markdown titles or paragraph text
  const lines = categoryData.content.split('\n');
  const tocItems = [];
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      // Add small spacing for empty lines
      const spacer = document.createElement('div');
      spacer.style.height = '1rem';
      mainDiv.appendChild(spacer);
      return;
    }

    const uniqueId = `rule-line-${idx}`;

    if (trimmed.startsWith('### ')) {
      const titleText = trimmed.substring(4);
      const h2 = document.createElement('h2');
      h2.className = 'chapter-title';
      h2.id = uniqueId;
      h2.style.cssText = `
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: 1.8rem;
        color: var(--text-light);
        margin-top: 2.5rem;
        margin-bottom: 1.25rem;
        border-bottom: 2px solid var(--primary);
        padding-bottom: 0.5rem;
        scroll-margin-top: 110px;
      `;
      h2.textContent = titleText;
      mainDiv.appendChild(h2);

      tocItems.push({ type: 'item', title: titleText, id: uniqueId });
    } else if (trimmed.startsWith('#### ')) {
      const titleText = trimmed.substring(5);
      const h3 = document.createElement('h3');
      h3.className = 'subchapter-title';
      h3.id = uniqueId;
      h3.style.cssText = `
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        font-size: 1.3rem;
        color: var(--primary);
        margin-top: 1.75rem;
        margin-bottom: 0.85rem;
        scroll-margin-top: 110px;
      `;
      h3.textContent = titleText;
      mainDiv.appendChild(h3);

      tocItems.push({ type: 'subitem', title: titleText, id: uniqueId });
    } else {
      const pEl = document.createElement('p');
      pEl.id = uniqueId;
      pEl.style.cssText = `
        margin-bottom: 0.85rem;
        font-size: 1.02rem;
        line-height: 1.65;
        color: var(--text-normal);
        scroll-margin-top: 120px;
      `;
      pEl.innerHTML = formatRuleText(trimmed);
      mainDiv.appendChild(pEl);

      const cleanText = pEl.textContent.trim();
      const isRule = cleanText.startsWith('•') || /^[0-9]+(\.[0-9]+)+[:\s]/.test(cleanText);
      if (isRule) {
        let ruleName = cleanText.replace(/^•\s*/, '').split(/[-–—:]/)[0].trim();
        if (ruleName.length > 40) {
          ruleName = ruleName.substring(0, 37) + '...';
        }
        tocItems.push({ type: 'rule', title: ruleName, id: uniqueId });
      }
    }
  });

  rulesContainer.appendChild(mainDiv);
  updateTOC(tocItems);
}

function updateTOC(tocItems) {
  if (!tocList) return;
  tocList.innerHTML = '';

  if (tocItems.length === 0) {
    if (tocSidebar) {
      tocSidebar.style.display = 'none';
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.classList.remove('has-toc');
    }
    return;
  }

  if (tocSidebar) {
    tocSidebar.style.display = 'block';
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.classList.add('has-toc');
  }

  tocItems.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    if (item.type === 'item') {
      a.className = 'toc-item';
      let title = item.title;
      if (title.length > 35) title = title.substring(0, 32) + '...';
      a.textContent = title;
    } else if (item.type === 'subitem') {
      a.className = 'toc-sub-item';
      a.style.paddingLeft = '1rem';
      a.style.fontWeight = '600';
      let title = item.title;
      if (title.length > 35) title = title.substring(0, 32) + '...';
      a.textContent = title;
    } else {
      a.className = 'toc-sub-item';
      let title = item.title;
      a.textContent = `• ${title}`;
    }
    
    a.href = `#${item.id}`;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const target = document.getElementById(item.id);
      if (target) {
        const yOffset = item.type === 'rule' ? -120 : -90;
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });

        target.classList.add('highlighted-pulse');
        setTimeout(() => target.classList.remove('highlighted-pulse'), 3000);
      }

      document.querySelectorAll('.toc-item, .toc-sub-item').forEach(link => link.classList.remove('active'));
      a.classList.add('active');
    });

    li.appendChild(a);
    tocList.appendChild(li);
  });

  initScrollspy(tocItems);
}

// Helper pentru formatare text reguli în badge-uri vizuale
function formatRuleText(text) {
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  let primaryBadge = '';
  let secondaryBadge = '';

  // 1. Extrage Amenzile (Primar)
  escaped = escaped.replace(/[\s\-–—|+:]*Amenda\s+([0-9.,]+)\$/gi, (match, p1) => {
    primaryBadge = `<span class="badge badge-fine">💵 Amendă: ${p1}$</span>`;
    return '';
  });

  // 2. Extrage Check Points (Primar)
  escaped = escaped.replace(/[\s\-–—|+:]*([0-9.]+)\s+Check\s+Points/gi, (match, p1) => {
    primaryBadge = `<span class="badge badge-cp">📍 ${p1} CP</span>`;
    return '';
  });

  // 3. Extrage Sentințele (Închisoare) (Secundar)
  escaped = escaped.replace(/[\s\-–—|+:]*Sentință\s+([0-9.]+)\s+Luni/gi, (match, p1) => {
    secondaryBadge = `<span class="badge badge-jail">🔒 Închisoare: ${p1} Luni</span>`;
    return '';
  });

  // 4. Extrage Avertismentele (Warn) (Secundar)
  escaped = escaped.replace(/[\s\-–—|+:]*([0-9.]+)\s+Warn/gi, (match, p1) => {
    secondaryBadge = `<span class="badge badge-warn">⚠️ ${p1} Warn</span>`;
    return '';
  });

  // 5. Extrage Ban (Secundar)
  escaped = escaped.replace(/[\s\-–—|+:]*Ban\s+Temporar/gi, () => {
    secondaryBadge = `<span class="badge badge-ban-temp">🚫 Ban Temporar</span>`;
    return '';
  });

  escaped = escaped.replace(/[\s\-–—|+:]*Ban\s+Permanent/gi, () => {
    secondaryBadge = `<span class="badge badge-ban">🚫 Ban Permanent</span>`;
    return '';
  });

  // Curăță delimitatorii și spațiile suplimentare rămase doar de la început/sfârșit
  let cleanText = escaped.trim()
    .replace(/\s*[|:\–\-+]+$/g, '')
    .replace(/^[|:\–\-+]+\s*/g, '')
    .trim();

  cleanText = cleanText.replace(/\s+/g, ' ');

  // Adaugă textul "(În funcție de gravitate)" lângă avertismente (warns) în mod inline
  if (secondaryBadge && secondaryBadge.includes('badge-warn')) {
    secondaryBadge = `
      <span style="display: inline-flex; align-items: center; gap: 4px; vertical-align: middle;">
        <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 500; font-family: inherit;">(În funcție de gravitate)</span>
        ${secondaryBadge}
      </span>
    `;
  }

  if (primaryBadge || secondaryBadge) {
    return `
      <span class="rule-text">${cleanText}</span>
      <span class="rule-badges" style="display: inline-flex; gap: 0.5rem; align-items: center; margin-left: 8px; vertical-align: middle; flex-wrap: wrap;">
        ${primaryBadge || ''}
        ${secondaryBadge || ''}
      </span>
    `;
  } else {
    return `<span class="rule-text">${cleanText}</span>`;
  }
}

// ==========================================
// SCROLLSPY OBSERVER
// ==========================================
function initScrollspy(tocItems) {
  if (scrollspyObserver) {
    scrollspyObserver.disconnect();
  }

  if (tocItems.length === 0) return;

  const options = {
    root: null,
    rootMargin: '-100px 0px -70% 0px',
    threshold: 0
  };

  scrollspyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const activeLink = document.querySelector(`.toc-sidebar a[href="#${id}"]`);
        if (activeLink) {
          document.querySelectorAll('.toc-item, .toc-sub-item').forEach(link => link.classList.remove('active'));
          activeLink.classList.add('active');
          activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    });
  }, options);

  tocItems.forEach(item => {
    const targetEl = document.getElementById(item.id);
    if (targetEl) scrollspyObserver.observe(targetEl);
  });
}

// ==========================================
// INTERACTIVE SEARCH
// ==========================================
rulesSearch.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (query.length < 2) {
    searchResults.innerHTML = '';
    searchResults.classList.remove('active');
    return;
  }

  const results = [];

  // Parcurgere toate categoriile
  Object.keys(allRulesData).forEach(catKey => {
    const category = allRulesData[catKey];
    if (!category.content) return;

    // Împărțim textul pe linii pentru a permite căutarea de reguli individuale
    const paragraphs = category.content.split('\n').filter(p => p.trim() !== '');
    
    paragraphs.forEach(pText => {
      if (pText.startsWith('###') || pText.startsWith('####')) return;

      const normalizedPText = pText.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (normalizedPText.includes(normalizedQuery)) {
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        let highlightedText = pText.replace(regex, '<mark>$1</mark>');
        
        if (highlightedText === pText) {
          const queryParts = query.split(/[^a-z0-9]+/i).filter(part => part.length >= 2);
          queryParts.forEach(part => {
            const partRegex = new RegExp(`(${escapeRegExp(part)})`, 'gi');
            highlightedText = highlightedText.replace(partRegex, '<mark>$1</mark>');
          });
        }

        results.push({
          categoryKey: catKey,
          categoryName: category.title,
          pText: pText,
          snippet: highlightedText
        });
      }
    });
  });

  renderSearchResults(results, query);
});

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderSearchResults(results, query) {
  searchResults.innerHTML = '';

  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="search-results-empty">
        Nu s-a găsit niciun rezultat pentru "<strong>${query}</strong>"
      </div>
    `;
  } else {
    results.forEach(res => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.innerHTML = `
        <div class="search-result-path">${res.categoryName}</div>
        <div class="search-result-snippet">${res.snippet}</div>
      `;

      div.addEventListener('click', () => {
        // Închide dropdown
        searchResults.classList.remove('active');
        rulesSearch.value = '';

        // Salt la categorie
        if (currentCategory !== res.categoryKey) {
          const tab = document.querySelector(`.category-tab[data-category="${res.categoryKey}"]`);
          if (tab) {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            switchCategory(res.categoryKey);
          }
        }

        // Salt la paragraf cu scroll
        setTimeout(() => {
          const paragraphs = document.querySelectorAll('#rulesContainer p');
          let foundParagraph = null;
          const cleanSearchText = res.pText.replace(/^[•\s\-\*]+/g, '').trim();
          
          for (const p of paragraphs) {
            if (p.textContent.includes(cleanSearchText)) {
              foundParagraph = p;
              break;
            }
          }
          
          if (foundParagraph) {
            const yOffset = -120;
            const y = foundParagraph.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            
            foundParagraph.classList.add('highlighted-pulse');
            setTimeout(() => foundParagraph.classList.remove('highlighted-pulse'), 3500);
          }
        }, 150);
      });

      searchResults.appendChild(div);
    });
  }

  searchResults.classList.add('active');
}

// Close search dropdown on click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrapper')) {
    searchResults.classList.remove('active');
  }
});

// ==========================================
// MODAL & AUTH FORMS
// ==========================================
function openModal() {
  authModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  authModal.classList.remove('active');
  document.body.style.overflow = '';
  loginForm.reset();
  registerForm.reset();
}

closeAuthBtn.addEventListener('click', closeModal);
authModal.addEventListener('click', (e) => {
  if (e.target === authModal) closeModal();
});

// Modal Tab Switch (Login / Register)
modalTabs.addEventListener('click', (e) => {
  const tabBtn = e.target.closest('.modal-tab-btn');
  if (!tabBtn) return;

  document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
  tabBtn.classList.add('active');

  const targetTab = tabBtn.dataset.tab;
  if (targetTab === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  } else {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
  }
});

// Submit Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('loginRememberMe').checked;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, rememberMe })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast("Conectare reușită! Bine ai venit.", "success");
      currentUser = data.user;
      renderUserWidget();
      closeModal();
      
      // Auto-redirect la admin dacă are grad staff
      const isStaff = ['admin', 'manager', 'tester-pd', 'tester-smurd', 'tester-staff', 'manager-mafii'].includes(currentUser.role);
      if (isStaff) {
        setTimeout(() => window.location.href = '/admin.html', 1000);
      }
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Eroare tehnică la conectare.", "error");
  }
});

// Submit Register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const fullName = document.getElementById('regFullName').value;
  const discordId = document.getElementById('regDiscord').value;
  const password = document.getElementById('regPassword').value;
  const requestedRole = document.getElementById('regRole').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullName, discordId, password, requestedRole })
    });
    
    const data = await response.json();
    
    if (data.success) {
      closeModal();
      // Popup popup de atentionare personalizat
      alert(`⚠️ ÎNREGISTRARE REUȘITĂ!\n\nContul tău ("${username}") a fost adăugat în sistem.\nPentru a te putea conecta, cererea trebuie să fie aprobată mai întâi de un Manager Staff.\n\nTe rugăm să iei legătura cu un Manager pentru activare.`);
      showToast("Cererea ta a fost înregistrată! Așteaptă aprobarea.", "info");
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Eroare la trimiterea cererii.", "error");
  }
});

// ==========================================
// SECȚIUNE APLICAȚII PORTAL (JUCĂTORI)
// ==========================================
let uploadedGangImageBase64 = '';
let uploadedBulletinImageBase64 = '';

function renderApplicationsSidebar() {
  // Oprește scrollspy observer temporar
  if (scrollspyObserver) {
    scrollspyObserver.disconnect();
  }
  updateTOC(); // Ascunde sidebar TOC (dreapta)
  
  chaptersList.innerHTML = `
    <h3 class="sidebar-title" style="margin-top: 0;">Tipuri Aplicații</h3>
    <li class="chapter-item expanded">
      <button class="chapter-btn active" data-form="smurd">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        Aplicație SMURD
      </button>
    </li>
    <li class="chapter-item expanded">
      <button class="chapter-btn" data-form="police">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Aplicație Poliție
      </button>
    </li>
    <li class="chapter-item expanded">
      <button class="chapter-btn" data-form="staff">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Aplicație Staff
      </button>
    </li>
    <li class="chapter-item expanded">
      <button class="chapter-btn" data-form="gang">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Cerere Gang / Mafie
      </button>
    </li>
  `;

  // Listeneri pe sidebar de aplicații
  document.querySelectorAll('.chapter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.chapter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const formType = btn.dataset.form;
      loadAndRenderApplicationForm(formType);
    });
  });
}

async function loadAndRenderApplicationForm(type) {
  rulesContainer.innerHTML = '<div class="rules-empty-state"><h3>Se încarcă formularul...</h3></div>';
  uploadedGangImageBase64 = ''; // resetează poza încărcată
  uploadedBulletinImageBase64 = ''; // resetează poza buletin

  // Verificare aplicație existentă în curs de evaluare
  const existingAppId = localStorage.getItem(`pending_app_${type}`);
  if (existingAppId) {
    try {
      const checkRes = await fetch(`/api/applications/check-status?id=${existingAppId}`);
      const checkData = await checkRes.json();
      if (checkData.success && checkData.status === 'pending') {
        let friendlyName = '';
        if (type === 'smurd') friendlyName = 'SMURD';
        else if (type === 'police') friendlyName = 'Poliție (PD)';
        else if (type === 'staff') friendlyName = 'Staff Server';
        else if (type === 'gang') friendlyName = 'Grupare Infracțională (Gang/Mafie)';

        rulesContainer.innerHTML = `
          <div class="rules-empty-state" style="padding: 4rem 2rem;">
            <div style="font-size: 3.5rem; margin-bottom: 1.5rem; filter: drop-shadow(0 0 10px rgba(226, 27, 60, 0.3));">⏳</div>
            <h3 style="color: var(--primary); font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-bottom: 1rem;">Aplicație în verificare</h3>
            <p style="color: var(--text-light); max-width: 500px; margin: 0 auto 1.5rem auto; line-height: 1.6;">
              Ai deja o aplicație trimisă pentru secțiunea <strong>${friendlyName}</strong> care se află în curs de evaluare de către Staff-ul VIPURI.
            </p>
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-light); padding: 1rem; border-radius: 8px; display: inline-block; max-width: 100%;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">Cod Unic Identificare:</span>
              <code style="display: block; font-family: monospace; font-size: 1rem; color: var(--primary); font-weight: bold; margin-top: 0.25rem;">${existingAppId}</code>
            </div>
            <p style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted);">Vei putea trimite o nouă cerere numai după ce un Manager procesează aplicația actuală.</p>
          </div>
        `;
        return;
      } else if (checkData.success && (checkData.status === 'accepted' || checkData.status === 'rejected' || checkData.status === 'not_found')) {
        localStorage.removeItem(`pending_app_${type}`);
      }
    } catch (e) {
      console.error("Eroare la verificarea statusului aplicației:", e);
    }
  }

  try {
    const response = await fetch('/api/applications/status');
    const data = await response.json();
    
    if (!data.success || !data.status) {
      showToast("Eroare la obținerea statusului aplicațiilor.", "error");
      return;
    }

    const isOpen = data.status[type];
    if (!isOpen) {
      let friendlyName = '';
      if (type === 'smurd') friendlyName = 'SMURD';
      else if (type === 'police') friendlyName = 'Poliție (PD)';
      else if (type === 'staff') friendlyName = 'Staff Server';
      else if (type === 'gang') friendlyName = 'Grupare Infracțională (Gang/Mafie)';

      rulesContainer.innerHTML = `
        <div class="rules-empty-state" style="padding: 4rem 2rem;">
          <h2 style="color: var(--text-light); font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 1rem;">Aplicații ${friendlyName}</h2>
          <div style="display: inline-block; padding: 2rem; border-radius: 12px; background: rgba(226, 27, 60, 0.05); border: 1px solid var(--primary); text-align: center; max-width: 500px; margin-top: 1rem; box-shadow: var(--shadow-neon);">
            <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🚫</span>
            <span style="font-size: 1.1rem; color: var(--text-light); font-weight: 600; display: block;">Momentan aplicațiile sunt închise.</span>
            <span style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-top: 0.5rem;">Te rugăm să revii mai târziu sau să urmărești anunțurile oficiale de pe Discord.</span>
          </div>
        </div>
      `;
      return;
    }

    // Preluare întrebări dinamice de pe server
    const qResponse = await fetch(`/api/applications/questions?type=${type}`);
    const qData = await qResponse.json();
    if (!qData.success || !qData.questions) {
      showToast("Eroare la obținerea întrebărilor formularului.", "error");
      return;
    }

    renderDynamicForm(type, qData.questions);

  } catch (error) {
    console.error("Eroare formular:", error);
    showToast("Eroare tehnică la încărcarea formularului.", "error");
  }
}

function renderDynamicForm(type, questions) {
  let friendlyName = '';
  if (type === 'smurd') friendlyName = 'Departament SMURD';
  else if (type === 'police') friendlyName = 'Departament Poliție (PD)';
  else if (type === 'staff') friendlyName = 'Staff Server';
  else if (type === 'gang') friendlyName = 'Grupare Infracțională (Gang/Mafie)';

  let formHtml = `<form id="appSubmitForm">`;

  // Pentru Poliție, redăm titlu specific OOC ca design inițial
  if (type === 'police') {
    formHtml += `
      <h3 style="color: var(--primary); margin: 0 0 1.25rem 0; font-family: 'Outfit', sans-serif; font-size: 1.1rem; border-bottom: 1px dashed var(--border-light); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Secțiunea Out-Of-Character (OOC)
      </h3>
    `;
  }

  questions.forEach(q => {
    formHtml += `
      <div class="form-group" style="margin-bottom: 1.5rem;">
        <label class="form-label" for="${q.id}" style="margin-bottom: 0.5rem; display: block; font-weight: 600;">${q.label}</label>
    `;

    if (q.type === 'text') {
      formHtml += `<input type="text" class="form-input" id="${q.id}" ${q.required ? 'required' : ''} placeholder="${q.placeholder || ''}">`;
    } else if (q.type === 'number') {
      formHtml += `<input type="number" class="form-input" id="${q.id}" ${q.required ? 'required' : ''} placeholder="${q.placeholder || ''}">`;
    } else if (q.type === 'textarea') {
      formHtml += `<textarea class="form-input" id="${q.id}" rows="4" ${q.required ? 'required' : ''} placeholder="${q.placeholder || ''}"></textarea>`;
    } else if (q.type === 'radio') {
      formHtml += `<div class="radio-group-premium">`;
      (q.options || ["DA", "NU"]).forEach(opt => {
        formHtml += `
          <label class="radio-tile">
            <input type="radio" name="${q.id}" value="${opt}" ${q.required ? 'required' : ''}>
            <span class="radio-tile-label">${opt}</span>
          </label>
        `;
      });
      formHtml += `</div>`;
    } else if (q.type === 'file') {
      formHtml += `
        <div class="file-upload-wrapper">
          <input type="file" id="${q.id}" accept="image/*" style="display: none;" ${q.required ? 'required' : ''}>
          <button type="button" class="btn-secondary file-upload-btn" onclick="document.getElementById('${q.id}').click()" style="padding: 0.6rem 1.2rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Selectează Imaginea (Max 2MB)
          </button>
          <div class="file-preview-name" id="previewName_${q.id}" style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--accent-green); display: none; font-weight: 600;"></div>
        </div>
      `;
    }

    formHtml += `</div>`;
  });

  formHtml += `
      <button type="submit" class="btn-primary" style="justify-content: center; width: 100%; margin-top: 2rem; padding: 0.9rem; font-size: 1rem; font-weight: bold; border-radius: 8px;">Trimite Aplicația</button>
    </form>
  `;

  rulesContainer.innerHTML = `
    <div class="form-container" style="padding: 2.5rem; border-radius: 16px; background: var(--bg-surface); border: 1px solid var(--border-light); box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-width: 800px; margin: 0 auto;">
      <h2 style="color: var(--text-light); font-family: 'Outfit', sans-serif; font-size: 1.6rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        ${friendlyName}
      </h2>
      ${formHtml}
    </div>
  `;

  // Adaugă file handlers dinamic pentru câmpurile file upload
  questions.forEach(q => {
    if (q.type === 'file') {
      const fileInput = document.getElementById(q.id);
      const previewName = document.getElementById(`previewName_${q.id}`);
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 2 * 1024 * 1024) {
              showToast("Imaginea depășește limita de 2MB!", "error");
              fileInput.value = '';
              return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
              fileInput.dataset.base64 = event.target.result;
              previewName.textContent = `Poză selectată: ${file.name}`;
              previewName.style.display = 'block';
              showToast("Poză încărcată!", "success");
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }
  });

  // Listener submit dinamic
  const submitForm = document.getElementById('appSubmitForm');
  submitForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {};
    let allOk = true;

    // Colectează valorile în funcție de tipul întrebării
    for (const q of questions) {
      if (q.type === 'radio') {
        const checkedRadio = submitForm.querySelector(`input[name="${q.id}"]:checked`);
        formData[q.id] = checkedRadio ? checkedRadio.value : '';
      } else if (q.type === 'file') {
        const fileInput = document.getElementById(q.id);
        const base64Data = fileInput ? (fileInput.dataset.base64 || '') : '';
        if (q.required && !base64Data) {
          showToast(`Te rugăm să încarci fișierul solicitat la întrebarea: ${q.label}`, "error");
          allOk = false;
          break;
        }
        formData[q.id] = base64Data;
      } else {
        const inputEl = document.getElementById(q.id);
        formData[q.id] = inputEl ? inputEl.value : '';
      }
    }

    if (allOk) {
      submitDynamicApplication(type, formData);
    }
  });
}

async function submitDynamicApplication(type, formData) {
  try {
    const submitBtn = document.querySelector('#appSubmitForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Se trimite...';
    }

    const response = await fetch('/api/applications/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, formData })
    });

    const data = await response.json();
    if (data.success) {
      if (data.application && data.application.id) {
        localStorage.setItem(`pending_app_${type}`, data.application.id);
      }
      showToast("Aplicația ta a fost înregistrată cu succes!", "success");
      rulesContainer.innerHTML = `
        <div class="rules-empty-state" style="padding: 4rem 2rem;">
          <div style="font-size: 3.5rem; margin-bottom: 1.5rem; filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.25));">✅</div>
          <h2 style="color: var(--text-light); font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 1rem;">Aplicație Trimisă!</h2>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 1.5rem auto; line-height: 1.6;">
            Formularul tău a fost înregistrat. Un membru staff din echipa corespunzătoare o va examina în cel mai scurt timp.
          </p>
          <button class="btn-primary" onclick="switchCategory('general')" style="margin: 0 auto;">Înapoi la Regulamente</button>
        </div>
      `;
    } else {
      showToast(data.message, "error");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Trimite din nou';
      }
    }
  } catch (err) {
    showToast("Eroare la trimiterea formularului.", "error");
    const submitBtn = document.querySelector('#appSubmitForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Trimite din nou';
    }
  }
}
