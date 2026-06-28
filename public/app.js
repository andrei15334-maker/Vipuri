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

  // 3. Reinițializează Scrollspy
  initScrollspy();
}

function renderSidebar(categoryData) {
  chaptersList.innerHTML = '';
  
  categoryData.chapters.forEach((chapter, index) => {
    const li = document.createElement('li');
    li.className = `chapter-item ${index === 0 ? 'expanded' : ''}`;
    
    const chapterBtn = document.createElement('button');
    chapterBtn.className = `chapter-btn ${index === 0 ? 'active' : ''}`;
    chapterBtn.dataset.target = chapter.id;
    chapterBtn.innerHTML = `
      <span>${chapter.title}</span>
      <svg class="chapter-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>
    `;

    // Click pe capitol -> expandează/colapsează subcapitole și navighează la capitol
    chapterBtn.addEventListener('click', (e) => {
      // Toggle expanded class pe elementul părinte li
      const parent = chapterBtn.closest('.chapter-item');
      
      // Colapsează celelalte capitole (opțional, dar arată mai curat)
      document.querySelectorAll('.chapter-item').forEach(item => {
        if (item !== parent) item.classList.remove('expanded');
      });
      parent.classList.toggle('expanded');

      // Scroll smooth la capitol
      const targetEl = document.getElementById(chapter.id);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }

      // Setează clasa active
      document.querySelectorAll('.chapter-btn').forEach(btn => btn.classList.remove('active'));
      chapterBtn.classList.add('active');
    });

    const subList = document.createElement('ul');
    subList.className = 'subchapters-list';
    
    chapter.subchapters.forEach(sub => {
      const subLi = document.createElement('li');
      const subLink = document.createElement('a');
      subLink.className = 'subchapter-link';
      subLink.href = `#${sub.id}`;
      subLink.textContent = sub.title;
      
      // Click pe subcapitol -> navighează fin
      subLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const targetEl = document.getElementById(sub.id);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          // Scurtă animație pulsatorie pe fundalul textului
          targetEl.classList.add('highlighted-pulse');
          setTimeout(() => targetEl.classList.remove('highlighted-pulse'), 3000);
        }

        document.querySelectorAll('.subchapter-link').forEach(link => link.classList.remove('active'));
        subLink.classList.add('active');
      });

      subLi.appendChild(subLink);
      subList.appendChild(subLi);
    });

    li.appendChild(chapterBtn);
    li.appendChild(subList);
    chaptersList.appendChild(li);
  });
}

function renderRulesText(categoryData) {
  rulesContainer.innerHTML = '';

  if (categoryData.chapters.length === 0) {
    rulesContainer.innerHTML = `
      <div class="rules-empty-state">
        <h3>Regulament gol</h3>
        <p>Acest regulament nu are capitole adăugate încă.</p>
      </div>
    `;
    return;
  }

  categoryData.chapters.forEach(chapter => {
    const chapterDiv = document.createElement('div');
    chapterDiv.className = 'chapter-section';
    chapterDiv.id = chapter.id;

    const h2 = document.createElement('h2');
    h2.className = 'chapter-title';
    h2.textContent = chapter.title;
    chapterDiv.appendChild(h2);

    chapter.subchapters.forEach(sub => {
      const subDiv = document.createElement('div');
      subDiv.className = 'subchapter-section';
      subDiv.id = sub.id;

      const h3 = document.createElement('h3');
      h3.className = 'subchapter-title';
      h3.textContent = sub.title;
      subDiv.appendChild(h3);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'subchapter-content';
      
      // Formatare text cu badge-uri vizuale
      const paragraphs = sub.content.split('\n').filter(p => p.trim() !== '');
      paragraphs.forEach(p => {
        const pEl = document.createElement('p');
        pEl.style.marginBottom = '0.75rem';
        pEl.innerHTML = formatRuleText(p);
        contentDiv.appendChild(pEl);
      });

      subDiv.appendChild(contentDiv);
      chapterDiv.appendChild(subDiv);
    });

    rulesContainer.appendChild(chapterDiv);
  });
}

// Helper pentru formatare text reguli în badge-uri vizuale
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
// SCROLLSPY OBSERVER
// ==========================================
function initScrollspy() {
  if (scrollspyObserver) {
    scrollspyObserver.disconnect();
  }

  const subchapters = document.querySelectorAll('.subchapter-section');
  if (subchapters.length === 0) return;

  const options = {
    root: null,
    rootMargin: '-120px 0px -60% 0px', // se activează când e în treimea de sus
    threshold: 0
  };

  scrollspyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        
        // Caută link-ul corespunzător în sidebar
        const activeLink = document.querySelector(`.subchapter-link[href="#${id}"]`);
        if (activeLink) {
          // Curăță celelalte link-uri active
          document.querySelectorAll('.subchapter-link').forEach(link => link.classList.remove('active'));
          activeLink.classList.add('active');

          // Caută butonul capitolului părinte și extinde-l
          const chapterItem = activeLink.closest('.chapter-item');
          if (chapterItem) {
            // Nu forța închidere dacă e deja deschis, doar asigură active
            document.querySelectorAll('.chapter-btn').forEach(btn => btn.classList.remove('active'));
            chapterItem.querySelector('.chapter-btn').classList.add('active');
            
            if (!chapterItem.classList.contains('expanded')) {
              // Colapsează celelalte
              document.querySelectorAll('.chapter-item').forEach(item => {
                if (item !== chapterItem) item.classList.remove('expanded');
              });
              chapterItem.classList.add('expanded');
            }
          }
        }
      }
    });
  }, options);

  subchapters.forEach(sec => scrollspyObserver.observe(sec));
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

  // Parcurgere toate categoriile, capitolele și subcapitolele pentru indexare
  Object.keys(allRulesData).forEach(catKey => {
    const category = allRulesData[catKey];
    category.chapters.forEach(chapter => {
      chapter.subchapters.forEach(sub => {
        const titleMatch = sub.title.toLowerCase().includes(query);
        const contentMatch = sub.content.toLowerCase().includes(query);

        if (titleMatch || contentMatch) {
          // Generare snippet
          let snippet = '';
          if (contentMatch) {
            const index = sub.content.toLowerCase().indexOf(query);
            const start = Math.max(0, index - 40);
            const end = Math.min(sub.content.length, index + query.length + 80);
            snippet = (start > 0 ? '...' : '') + sub.content.slice(start, end) + (end < sub.content.length ? '...' : '');
            
            // Înlocuire cu mark tag-uri pentru highlight
            const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
            snippet = snippet.replace(regex, '<mark>$1</mark>');
          } else {
            snippet = sub.content.substring(0, 100) + '...';
          }

          results.push({
            categoryKey: catKey,
            categoryName: category.title,
            chapterId: chapter.id,
            subchapterId: sub.id,
            subchapterTitle: sub.title,
            snippet: snippet
          });
        }
      });
    });
  });

  // Randare rezultate
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
        <div class="search-result-title">${res.subchapterTitle}</div>
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

        // Salt la subcapitol cu scroll și expandare
        setTimeout(() => {
          const targetEl = document.getElementById(res.subchapterId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
            targetEl.classList.add('highlighted-pulse');
            setTimeout(() => targetEl.classList.remove('highlighted-pulse'), 3500);

            // Activare în sidebar
            const activeLink = document.querySelector(`.subchapter-link[href="#${res.subchapterId}"]`);
            if (activeLink) {
              document.querySelectorAll('.subchapter-link').forEach(link => link.classList.remove('active'));
              activeLink.classList.add('active');
              
              const parent = activeLink.closest('.chapter-item');
              if (parent) {
                document.querySelectorAll('.chapter-item').forEach(item => item.classList.remove('expanded'));
                parent.classList.add('expanded');
              }
            }
          }
        }, 150); // timp scurt pentru re-randare pagină dacă s-a schimbat categoria
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

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast("Conectare reușită! Bine ai venit.", "success");
      currentUser = data.user;
      renderUserWidget();
      closeModal();
      
      // Auto-redirect la admin dacă are drepturi
      if (currentUser.role === 'admin' || currentUser.role === 'manager') {
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

    // Randează formularul corespunzător
    renderFormInputs(type);

  } catch (error) {
    console.error("Eroare formular:", error);
    showToast("Eroare tehnică la încărcarea formularului.", "error");
  }
}

function renderFormInputs(type) {
  let formHtml = '';
  let title = '';

  if (type === 'smurd') {
    title = 'Formular Recrutare - Departament SMURD';
    formHtml = `
      <form id="appSubmitForm">
        <div class="form-group">
          <label class="form-label" for="smurdId">1. ID Jucător (cifre din joc)</label>
          <input type="number" class="form-input" id="smurdId" required placeholder="Ex: 1042">
        </div>
        <div class="form-group">
          <label class="form-label" for="smurdAge">2. Vârstă OOC (cifre)</label>
          <input type="number" class="form-input" id="smurdAge" required min="1" max="99" placeholder="Vârsta ta reală">
        </div>
        <div class="form-group">
          <label class="form-label" for="smurdHours">3. Ore jucate pe server (minim 10)</label>
          <input type="number" class="form-input" id="smurdHours" required min="10" placeholder="Orele tale pe server">
        </div>
        <div class="form-group">
          <label class="form-label" for="smurdReason">4. De ce doriți să vă alăturați acestui departament?</label>
          <textarea class="form-input" id="smurdReason" rows="4" required placeholder="Scrie argumentele tale..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">5. Aveți un cazier la activ în momentul de față?</label>
          <div class="radio-group-premium">
            <label class="radio-tile">
              <input type="radio" name="smurdRecord" value="DA" required>
              <span class="radio-tile-label">DA</span>
            </label>
            <label class="radio-tile">
              <input type="radio" name="smurdRecord" value="NU" required>
              <span class="radio-tile-label">NU</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">6. Sunteți conștienți de consecințele corupției?</label>
          <div class="radio-group-premium">
            <label class="radio-tile">
              <input type="radio" name="smurdCorruption" value="DA" required>
              <span class="radio-tile-label">DA</span>
            </label>
            <label class="radio-tile">
              <input type="radio" name="smurdCorruption" value="NU" required>
              <span class="radio-tile-label">NU</span>
            </label>
          </div>
        </div>
        <button type="submit" class="btn-primary" style="justify-content: center; width: 100%; margin-top: 1.5rem; padding: 0.85rem;">Trimite Aplicația SMURD</button>
      </form>
    `;
  } else if (type === 'police') {
    title = 'Formular Recrutare - Departament Poliție (PD)';
    formHtml = `
      <form id="appSubmitForm">
        <!-- OOC Section -->
        <h3 style="color: var(--primary); margin: 0 0 1.25rem 0; font-family: 'Outfit', sans-serif; font-size: 1.1rem; border-bottom: 1px dashed var(--border-light); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Secțiunea Out-Of-Character (OOC)
        </h3>
        
        <div class="form-group">
          <label class="form-label" for="pdName">Nume Prenume OOC (Real)</label>
          <input type="text" class="form-input" id="pdName" required placeholder="Numele tău complet">
        </div>
        <div class="form-group">
          <label class="form-label" for="pdAge">Vârstă OOC (cifre)</label>
          <input type="number" class="form-input" id="pdAge" required min="1" placeholder="Vârsta ta reală">
        </div>
        <div class="form-group">
          <label class="form-label" for="pdQualities">Minim 3 calități pe care consideri că le ai și explică</label>
          <textarea class="form-input" id="pdQualities" rows="4" required placeholder="Descrie și motivează calitățile..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="pdDefects">Minim 3 defecte pe care consideri că le ai și explică</label>
          <textarea class="form-input" id="pdDefects" rows="4" required placeholder="Descrie și motivează defectele..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="pdDesc">Descrie-te în minim 50 de cuvinte</label>
          <textarea class="form-input" id="pdDesc" rows="4" required placeholder="Minim 50 de cuvinte..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="pdHours">Ore Jucate pe Server</label>
          <input type="number" class="form-input" id="pdHours" required min="0" placeholder="Ore jucate">
        </div>
        <div class="form-group">
          <label class="form-label" for="pdDedicatedHours">Câte ore vei dedica zilnic facțiunii?</label>
          <input type="number" class="form-input" id="pdDedicatedHours" required min="1" placeholder="Ex: 3 ore">
        </div>
        <div class="form-group">
          <label class="form-label">Faci Parte dintr-o organizație?</label>
          <div class="radio-group-premium">
            <label class="radio-tile">
              <input type="radio" name="pdOrg" value="Da" required>
              <span class="radio-tile-label">DA</span>
            </label>
            <label class="radio-tile">
              <input type="radio" name="pdOrg" value="Nu" required>
              <span class="radio-tile-label">NU</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="pdDiscord">Nume utilizator Discord</label>
          <input type="text" class="form-input" id="pdDiscord" required placeholder="Ex: discord_user">
        </div>

        <!-- IC Section -->
        <h3 style="color: var(--primary); margin: 2rem 0 1.25rem 0; font-family: 'Outfit', sans-serif; font-size: 1.1rem; border-bottom: 1px dashed var(--border-light); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Secțiunea In-Character (IC)
        </h3>
        
        <div class="form-group">
          <label class="form-label" for="pdNameIc">Nume și prenume IC</label>
          <input type="text" class="form-input" id="pdNameIc" required placeholder="Ex: John Doe">
        </div>
        
        <div class="form-group">
          <label class="form-label" for="pdBulletinImage">Poza Buletin IC</label>
          <input type="file" class="form-input" id="pdBulletinImage" accept="image/*" required style="padding-top: 0.50rem;">
          <div id="bulletinPreviewContainer" style="margin-top: 0.75rem; display: none; text-align: center;">
            <img id="pdBulletinPreview" src="" alt="Previzualizare Buletin" style="max-height: 150px; border-radius: 8px; border: 1px solid var(--border-light); box-shadow: var(--shadow-neon);">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="pdCnpIc">CNP IC (cifre joc)</label>
          <input type="number" class="form-input" id="pdCnpIc" required placeholder="CNP personaj">
        </div>

        <div class="form-group">
          <label class="form-label" for="pdAgeIc">Vârstă IC (cifre joc)</label>
          <input type="number" class="form-input" id="pdAgeIc" required min="1" placeholder="Vârstă personaj">
        </div>

        <div class="form-group">
          <label class="form-label">Ai citit regulamentul?</label>
          <div class="radio-group-premium">
            <label class="radio-tile">
              <input type="radio" name="pdReadRules" value="DA" required>
              <span class="radio-tile-label">DA</span>
            </label>
            <label class="radio-tile">
              <input type="radio" name="pdReadRules" value="NU" required>
              <span class="radio-tile-label">NU</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="pdStoryIc">Povestea Caracterului (IC)</label>
          <textarea class="form-input" id="pdStoryIc" rows="5" required placeholder="Scrie povestea și trecutul personajului tău..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="pdReasonDept">De ce dorești în acest departament?</label>
          <textarea class="form-input" id="pdReasonDept" rows="4" required placeholder="Motivează alegerea ta..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="pdGoalIc">Unde dorești să ajungi ca și polițist?</label>
          <textarea class="form-input" id="pdGoalIc" rows="3" required placeholder="Planurile de viitor în cadrul facțiunii..."></textarea>
        </div>

        <!-- Regulament Confirm -->
        <h3 style="color: var(--primary); margin: 2rem 0 1.25rem 0; font-family: 'Outfit', sans-serif; font-size: 1.1rem; border-bottom: 1px dashed var(--border-light); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Confirmare de Luare la Cunoștință
        </h3>
        <div class="form-group">
          <label class="form-label">Confirm că am luat la cunoștință că dacă voi fi acceptat voi susține testul din Regulament Server, Regulament Poliție și codurile pentru licența Radio!</label>
          <div class="radio-group-premium">
            <label class="radio-tile">
              <input type="radio" name="pdConfirm" value="DA" required>
              <span class="radio-tile-label">DA</span>
            </label>
            <label class="radio-tile">
              <input type="radio" name="pdConfirm" value="NU" required>
              <span class="radio-tile-label">NU</span>
            </label>
          </div>
        </div>

        <button type="submit" class="btn-primary" style="justify-content: center; width: 100%; margin-top: 1.5rem; padding: 0.85rem;">Trimite Aplicația Poliție</button>
      </form>
    `;
  } else if (type === 'staff') {
    title = 'Formular Înscriere - Echipă Staff Vipuri Roleplay';
    formHtml = `
      <form id="appSubmitForm">
        <div class="form-group">
          <label class="form-label" for="staffEmail">Adresă de e-mail</label>
          <input type="email" class="form-input" id="staffEmail" required placeholder="Ex: contact@email.com">
        </div>
        <div class="form-group">
          <label class="form-label" for="staffNameAge">Nume + Vârstă</label>
          <input type="text" class="form-input" id="staffNameAge" required placeholder="Ex: Andrei, 17 ani">
        </div>
        <div class="form-group">
          <label class="form-label" for="staffHours">Ore jucate pe server (minim 100)</label>
          <input type="number" class="form-input" id="staffHours" required min="100" placeholder="Ore jucate pe server">
        </div>
        <div class="form-group">
          <label class="form-label" for="staffDiscord">Discord Username</label>
          <input type="text" class="form-input" id="staffDiscord" required placeholder="Username Discord">
        </div>
        <div class="form-group">
          <label class="form-label" for="staffId">ID Server (in-game ID)</label>
          <input type="number" class="form-input" id="staffId" required placeholder="ID joc">
        </div>
        <div class="form-group">
          <label class="form-label">Ești conștient că dacă aplicația ta nu va fi destul de dezvoltată și de bine punctată, aceasta poate fi respinsă?</label>
          <div class="radio-group-premium">
            <label class="radio-tile">
              <input type="radio" name="staffAwareness" value="DA" required>
              <span class="radio-tile-label">DA</span>
            </label>
            <label class="radio-tile">
              <input type="radio" name="staffAwareness" value="NU" required>
              <span class="radio-tile-label">NU</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="staffRating">Cât de bine cunoști regulamentul serverului?</label>
          <select class="form-select" id="staffRating" required>
            <option value="" disabled selected>Selectează o opțiune...</option>
            <option value="1">1 (Deloc)</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10 (Foarte bine)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="staffReason">Ce te-a determinat să aplici în staff?</label>
          <textarea class="form-input" id="staffReason" rows="4" required placeholder="Dezvoltă motivele..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="staffExp">Ai mai fost staff pe alte servere? Dacă da, ce grade ai avut?</label>
          <textarea class="form-input" id="staffExp" rows="4" required placeholder="Descrie experiența ta anterioară..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Sunteți de acord că trebuie să lăsați prieteniile deoparte și să acționați corect în orice situație?</label>
          <div class="radio-group-premium">
            <label class="radio-tile">
              <input type="radio" name="staffFairplay" value="DA" required>
              <span class="radio-tile-label">DA</span>
            </label>
            <label class="radio-tile">
              <input type="radio" name="staffFairplay" value="NU" required>
              <span class="radio-tile-label">NU</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="staffMerit">De ce credeți că meritați această funcție (Minim 20 cuvinte)?</label>
          <textarea class="form-input" id="staffMerit" rows="4" required placeholder="Scrie argumentele în minim 20 de cuvinte..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="staffTime">Cât timp ești dispus să investești în fiecare zi? (ore)</label>
          <input type="number" class="form-input" id="staffTime" required min="1" placeholder="Ore zilnic">
        </div>
        <div class="form-group">
          <label class="form-label" for="staffAltercations">Ați avut altercații, discuții aprinse cu oricare dintre membrii staff-ului? (exemple)</label>
          <textarea class="form-input" id="staffAltercations" rows="4" required placeholder="Dacă nu ai avut, scrie: Nu am avut."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="staffRole">Cu ce credeți că se ocupă un membru staff?</label>
          <textarea class="form-input" id="staffRole" rows="4" required placeholder="Descrie sarcinile unui membru staff..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="staffDesc">Descrierea ta personală</label>
          <textarea class="form-input" id="staffDesc" rows="4" required placeholder="Detalii despre tine, caracter, hobby-uri..."></textarea>
        </div>
        <button type="submit" class="btn-primary" style="justify-content: center; width: 100%; margin-top: 1.5rem; padding: 0.85rem;">Trimite Aplicația Staff</button>
      </form>
    `;
  } else if (type === 'gang') {
    title = 'Formular Înregistrare Grupări - Cerere Gang / Mafie';
    formHtml = `
      <form id="appSubmitForm">
        <div class="form-group">
          <label class="form-label" for="gangName">[OOC] Nume Lider (Real)</label>
          <input type="text" class="form-input" id="gangName" required placeholder="Numele tău real">
        </div>
        <div class="form-group">
          <label class="form-label" for="gangHours">[OOC] Ore pe server</label>
          <input type="number" class="form-input" id="gangHours" required min="0" placeholder="Ore jucate">
        </div>
        <div class="form-group">
          <label class="form-label" for="gangMembers">[OOC] ID-uri membrii grupării</label>
          <textarea class="form-input" id="gangMembers" rows="3" required placeholder="Enumerați ID-urile tuturor membrilor..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="gangOrg">[IC] Nume Organizație / Mafie / Gang</label>
          <input type="text" class="form-input" id="gangOrg" required placeholder="Numele facțiunii (ex: Grove Street)">
        </div>
        <div class="form-group">
          <label class="form-label" for="gangPhone">[IC] Număr de telefon LIDER</label>
          <input type="number" class="form-input" id="gangPhone" required placeholder="Număr de telefon in-game">
        </div>
        <div class="form-group">
          <label class="form-label" for="gangStory">[IC] Povestea Organizației (Istoric & Scopuri)</label>
          <textarea class="form-input" id="gangStory" rows="6" required placeholder="Scrie povestea organizației în detaliu..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="gangImage">Poze cu organizația (poze cu membrii/logo-uri/etc)</label>
          <input type="file" class="form-input" id="gangImage" accept="image/*" required style="padding-top: 0.50rem;">
          <div id="imagePreviewContainer" style="margin-top: 0.75rem; display: none; text-align: center;">
            <img id="gangImagePreview" src="" alt="Previzualizare Logo" style="max-height: 150px; border-radius: 8px; border: 1px solid var(--border-light); box-shadow: var(--shadow-neon);">
          </div>
        </div>
        <button type="submit" class="btn-primary" style="justify-content: center; width: 100%; margin-top: 1.5rem; padding: 0.85rem;">Trimite Cererea de Gang</button>
      </form>
    `;
  }

  rulesContainer.innerHTML = `
    <div class="form-container" style="padding: 2.5rem; border-radius: 16px; background: var(--bg-surface); border: 1px solid var(--border-light); box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-width: 800px; margin: 0 auto;">
      <h2 style="color: var(--text-light); font-family: 'Outfit', sans-serif; font-size: 1.6rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        ${title}
      </h2>
      ${formHtml}
    </div>
  `;

  // Eveniment de upload poza buletin (daca este police)
  if (type === 'police') {
    const fileInput = document.getElementById('pdBulletinImage');
    const previewContainer = document.getElementById('bulletinPreviewContainer');
    const imagePreview = document.getElementById('pdBulletinPreview');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Limitare dimensiune imagine (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          showToast("Imaginea este prea mare! Dimensiunea maximă permisă este de 2MB.", "error");
          fileInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
          uploadedBulletinImageBase64 = evt.target.result;
          imagePreview.src = uploadedBulletinImageBase64;
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Eveniment de upload poza (daca este gang)
  if (type === 'gang') {
    const fileInput = document.getElementById('gangImage');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('gangImagePreview');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Limitare dimensiune imagine (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          showToast("Imaginea este prea mare! Dimensiunea maximă permisă este de 2MB.", "error");
          fileInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
          uploadedGangImageBase64 = evt.target.result;
          imagePreview.src = uploadedGangImageBase64;
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Interceptează submit formular
  const formEl = document.getElementById('appSubmitForm');
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Extragere date formular
    let formData = {};

    if (type === 'smurd') {
      formData = {
        idJoc: document.getElementById('smurdId').value,
        varsta: document.getElementById('smurdAge').value,
        oreJucate: document.getElementById('smurdHours').value,
        motiv: document.getElementById('smurdReason').value,
        cazier: formEl.querySelector('input[name="smurdRecord"]:checked').value,
        consecinteCoruptie: formEl.querySelector('input[name="smurdCorruption"]:checked').value
      };
    } else if (type === 'police') {
      const confirmVal = formEl.querySelector('input[name="pdConfirm"]:checked').value;
      if (confirmVal !== 'DA') {
        showToast("Trebuie să selectezi DA la confirmarea regulamentelor pentru a trimite aplicația.", "error");
        return;
      }

      if (!uploadedBulletinImageBase64) {
        showToast("Te rugăm să încarci poza cu Buletinul tău IC.", "error");
        return;
      }

      formData = {
        numeOoc: document.getElementById('pdName').value,
        varstaOoc: document.getElementById('pdAge').value,
        calitati: document.getElementById('pdQualities').value,
        defecte: document.getElementById('pdDefects').value,
        descriere: document.getElementById('pdDesc').value,
        oreJucate: document.getElementById('pdHours').value,
        oreZilnice: document.getElementById('pdDedicatedHours').value,
        organizatie: formEl.querySelector('input[name="pdOrg"]:checked').value,
        confirmare: confirmVal,
        discord: document.getElementById('pdDiscord').value,
        // IC fields
        numeIc: document.getElementById('pdNameIc').value,
        pozaBuletinIc: uploadedBulletinImageBase64,
        cnpIc: document.getElementById('pdCnpIc').value,
        varstaIc: document.getElementById('pdAgeIc').value,
        cititRegulament: formEl.querySelector('input[name="pdReadRules"]:checked').value,
        povesteCaracter: document.getElementById('pdStoryIc').value,
        motivDepartament: document.getElementById('pdReasonDept').value,
        scopPolitist: document.getElementById('pdGoalIc').value
      };
    } else if (type === 'staff') {
      formData = {
        email: document.getElementById('staffEmail').value,
        numeVarsta: document.getElementById('staffNameAge').value,
        oreJucate: document.getElementById('staffHours').value,
        discord: document.getElementById('staffDiscord').value,
        idServer: document.getElementById('staffId').value,
        cunoscutRespingere: formEl.querySelector('input[name="staffAwareness"]:checked').value,
        ratingRegulament: document.getElementById('staffRating').value,
        motivAplicare: document.getElementById('staffReason').value,
        experientaStaff: document.getElementById('staffExp').value,
        fairplayPrieteni: formEl.querySelector('input[name="staffFairplay"]:checked').value,
        deCeMerit: document.getElementById('staffMerit').value,
        timpZilnic: document.getElementById('staffTime').value,
        altercatiiStaff: document.getElementById('staffAltercations').value,
        rolStaff: document.getElementById('staffRole').value,
        descrierePersonala: document.getElementById('staffDesc').value
      };
    } else if (type === 'gang') {
      if (!uploadedGangImageBase64) {
        showToast("Te rugăm să încarci o poză pentru organizație.", "error");
        return;
      }

      formData = {
        numeOoc: document.getElementById('gangName').value,
        oreServer: document.getElementById('gangHours').value,
        idMembrii: document.getElementById('gangMembers').value,
        numeOrganizatie: document.getElementById('gangOrg').value,
        telefonLider: document.getElementById('gangPhone').value,
        povesteOrganizatie: document.getElementById('gangStory').value,
        pozeOrganizatie: uploadedGangImageBase64
      };
    }

    // Trimitere către server
    try {
      const submitBtn = formEl.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Se trimite...';

      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, formData })
      });

      const data = await response.json();
      if (data.success) {
        showToast("Aplicația ta a fost înregistrată cu succes!", "success");
        // Randează ecranul de succes
        rulesContainer.innerHTML = `
          <div class="rules-empty-state" style="padding: 4rem 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
            <h2 style="color: var(--text-light); font-family: 'Outfit', sans-serif;">Aplicație Trimisă!</h2>
            <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 1.5rem auto;">
              Formularul tău a fost înregistrat. Un membru staff din echipa corespunzătoare o va examina în cel mai scurt timp.
            </p>
            <button class="btn-primary" onclick="switchCategory('general')" style="margin: 0 auto;">Înapoi la Regulamente</button>
          </div>
        `;
      } else {
        showToast(data.message, "error");
        submitBtn.disabled = false;
        submitBtn.textContent = 'Trimite din nou';
      }
    } catch (err) {
      showToast("Eroare la trimiterea formularului.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = 'Trimite din nou';
    }
  });
}
