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
      Conectare Staff
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
