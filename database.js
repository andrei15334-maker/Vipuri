const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.json');

// Helper to generate salt and hash password
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return { salt, hash };
}

// Default rules data to seed the database
const defaultRules = {
  "general": {
    "title": "Regulament General",
    "content": "Regulament General..."
  },
  "sanctiuni": {
    "title": "Lista Sancțiuni",
    "content": "Sancțiuni..."
  },
  "pd": {
    "title": "Regulament Poliție",
    "content": "Poliție..."
  },
  "smurd": {
    "title": "Regulament SMURD",
    "content": "SMURD..."
  },
  "mafii": {
    "title": "Regulament Mafii / Gang",
    "content": "Mafii..."
  },
  "cod-penal": {
    "title": "Cod Penal",
    "content": "Cod Penal..."
  },
  "lideri": {
    "title": "Regulament Lideri",
    "content": "Lideri..."
  }
};

const defaultQuestions = {
  smurd: [
    { id: "q_smurd_1", type: "number", label: "1. ID Jucător (cifre din joc)", required: true, placeholder: "Ex: 1042" },
    { id: "q_smurd_2", type: "number", label: "2. Vârstă OOC (cifre)", required: true, placeholder: "Vârsta ta reală" },
    { id: "q_smurd_3", type: "number", label: "3. Ore jucate pe server (minim 10)", required: true, placeholder: "Orele tale pe server" },
    { id: "q_smurd_4", type: "textarea", label: "4. De ce doriți să vă alăturați acestui departament?", required: true, placeholder: "Scrie argumentele tale..." },
    { id: "q_smurd_5", type: "radio", label: "5. Aveți un cazier la activ în momentul de față?", options: ["DA", "NU"], required: true },
    { id: "q_smurd_6", type: "radio", label: "6. Sunteți conștienți de consecințele corupției?", options: ["DA", "NU"], required: true }
  ],
  police: [
    { id: "q_pd_1", type: "text", label: "[OOC] Nume Prenume OOC (Real)", required: true, placeholder: "Numele tău complet" },
    { id: "q_pd_2", type: "number", label: "[OOC] Vârstă OOC (cifre)", required: true, placeholder: "Vârsta ta reală" },
    { id: "q_pd_3", type: "textarea", label: "[OOC] Calități personale (minim 3)", required: true, placeholder: "Ex: Răbdător, calm, comunicativ..." },
    { id: "q_pd_4", type: "textarea", label: "[OOC] Defecte personale (minim 3)", required: true, placeholder: "Fii sincer..." },
    { id: "q_pd_5", type: "textarea", label: "[OOC] Descriere personală (minim 30 de cuvinte)", required: true, placeholder: "Detalii despre tine OOC..." },
    { id: "q_pd_6", type: "number", label: "[OOC] Ore jucate pe server (minim 15)", required: true, placeholder: "Ore jucate pe server" },
    { id: "q_pd_7", type: "number", label: "[OOC] Câte ore poți dedica pe zi departamentului?", required: true, placeholder: "Ore dedicate zilnic" },
    { id: "q_pd_8", type: "radio", label: "[OOC] Faci parte dintr-o facțiune / mafie / organizație în acest moment?", options: ["DA", "NU"], required: true },
    { id: "q_pd_9", type: "radio", label: "[OOC] Ești de acord să părăsești facțiunea actuală dacă ești acceptat (dacă este cazul)?", options: ["DA", "NU"], required: true },
    { id: "q_pd_10", type: "text", label: "[OOC] Discord ID (ex: nume#0000 sau nume)", required: true, placeholder: "Discord Username" },
    { id: "q_pd_11", type: "text", label: "[IC] Nume și Prenume caracter joc", required: true, placeholder: "Numele caracterului din joc" },
    { id: "q_pd_12", type: "file", label: "[IC] Poza cu buletinul din joc (/buletin)", required: true },
    { id: "q_pd_13", type: "number", label: "[IC] CNP Caracter (ID joc)", required: true, placeholder: "ID-ul tău din joc" },
    { id: "q_pd_14", type: "number", label: "[IC] Vârstă Caracter joc (cifre)", required: true, placeholder: "Vârsta personajului in-game" },
    { id: "q_pd_15", type: "radio", label: "[IC] Ați citit regulamentul departamentului?", options: ["DA", "NU"], required: true },
    { id: "q_pd_16", type: "textarea", label: "[IC] Istoricul / Povestea caracterului tău (minim 50 cuvinte)", required: true, placeholder: "Trecutul, evenimente cheie..." },
    { id: "q_pd_17", type: "textarea", label: "[IC] De ce vrei să intri în departamentul de Poliție din VIPURI?", required: true, placeholder: "Motivele tale..." },
    { id: "q_pd_18", type: "textarea", label: "[IC] Care sunt scopurile tale ca viitor polițist?", required: true, placeholder: "Ce dorești să realizezi..." },
    { id: "q_pd_19", type: "radio", label: "[Confirmare] Confirm că am luat la cunoștință că dacă voi fi acceptat voi susține testul din Regulament Server, Regulament Poliție și codurile pentru licența Radio!", options: ["DA", "NU"], required: true }
  ],
  staff: [
    { id: "q_staff_1", type: "text", label: "Adresă de e-mail", required: true, placeholder: "Ex: contact@email.com" },
    { id: "q_staff_2", type: "text", label: "Nume + Vârstă:", required: true, placeholder: "Ex: Andrei, 18 ani" },
    { id: "q_staff_3", type: "number", label: "Ore jucate pe server (minim 100)", required: true, placeholder: "Ore jucate" },
    { id: "q_staff_4", type: "text", label: "Discord Username:", required: true, placeholder: "Ex: discord_user" },
    { id: "q_staff_5", type: "number", label: "ID Server:", required: true, placeholder: "Ex: 1042" },
    { id: "q_staff_6", type: "radio", label: "Ești conștient că dacă aplicația ta nu va fi destul de dezvoltată și de bine punctată, aceasta poate fi respinsă?", options: ["DA", "NU"], required: true },
    { id: "q_staff_7", type: "radio", label: "Dezvoltă fiecare întrebare cât mai bine și cât mai în detaliu, nu te grăbi în completarea formularului. Cât de bine cunoști regulamentul serverului?", options: ["1 (Deloc)", "2", "3", "4", "5", "6", "7", "8", "9", "10 (Foarte bine)"], required: true },
    { id: "q_staff_8", type: "textarea", label: "Ce te-a determinat să aplici în staff?", required: true, placeholder: "Motivele tale..." },
    { id: "q_staff_9", type: "textarea", label: "Ai mai fost staff pe alte servere? Dacă da, care și ce grade ai avut?", required: true, placeholder: "Experiența anterioară..." },
    { id: "q_staff_10", type: "radio", label: "Sunteți de acord că trebuie să lăsați prieteniile deoparte și să acționați corect în orice situație?", options: ["DA", "NU"], required: true },
    { id: "q_staff_11", type: "textarea", label: "De ce credeți că meritați această funcție (Minim 20 cuvinte):", required: true, placeholder: "Argumentele tale..." },
    { id: "q_staff_12", type: "number", label: "Cât timp ești dispus să investești în fiecare zi?", required: true, placeholder: "Număr de ore" },
    { id: "q_staff_13", type: "textarea", label: "Ați avut altercații, discuții aprinse cu oricare dintre membrii staff-ului? (exemple):", required: true, placeholder: "Dacă nu ai avut, scrie: Nu am avut." },
    { id: "q_staff_14", type: "textarea", label: "Cu ce credeți că se ocupă un membru staff?:", required: true, placeholder: "Rolul unui membru staff..." },
    { id: "q_staff_15", type: "textarea", label: "Descrierea ta personală:", required: true, placeholder: "Detalii despre tine, caracter, hobby-uri..." }
  ],
  gang: [
    { id: "q_gang_1", type: "text", label: "Nume OOC (Real)", required: true, placeholder: "Numele tău" },
    { id: "q_gang_2", type: "text", label: "Discord ID Lider", required: true, placeholder: "Discord-ul tău" },
    { id: "q_gang_3", type: "number", label: "ID Lider în joc", required: true, placeholder: "Ex: 999" },
    { id: "q_gang_4", type: "number", label: "Ore jucate pe server Lider", required: true, placeholder: "Ore jucate" },
    { id: "q_gang_5", type: "textarea", label: "ID-urile membrilor care fac parte din gang (minim 5 membri)", required: true, placeholder: "Ex: Lider (999), Co-Lider (102)..." },
    { id: "q_gang_6", type: "text", label: "Numele Organizației / Mafiei", required: true, placeholder: "Ex: Corleone, Yakuza..." },
    { id: "q_gang_7", type: "text", label: "Număr de telefon în joc Lider", required: true, placeholder: "Ex: 123-456" },
    { id: "q_gang_8", type: "textarea", label: "Povestea / Istoria Organizației tale", required: true, placeholder: "Descrie trecutul, activitățile și scopul..." },
    { id: "q_gang_9", type: "file", label: "Dovadă poza cu membrii / buletine (Urcă o imagine reprezentativă)", required: true }
  ]
};

class Database {
  constructor() {
    this.data = {
      users: [],
      rules: defaultRules,
      logs: [],
      applications: [],
      appStatus: { police: true, smurd: true, staff: true, gang: true },
      applicationLogs: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(fileContent);
        // Asigură-te că proprietățile există în fișierul încărcat
        if (!this.data.rules || Object.keys(this.data.rules).length === 0 || !this.data.rules.general) {
          this.data.rules = defaultRules;
          this.save();
        }
        if (!this.data.logs) {
          this.data.logs = [];
          this.save();
        }
        if (!this.data.applications) {
          this.data.applications = [];
          this.save();
        }
        if (!this.data.appStatus) {
          this.data.appStatus = { police: true, smurd: true, staff: true, gang: true };
          this.save();
        }
        if (!this.data.applicationLogs) {
          this.data.applicationLogs = [];
          this.save();
        }
        if (!this.data.applicationQuestions) {
          this.data.applicationQuestions = defaultQuestions;
          this.save();
        }
      } else {
        // Seed utilizator manager inițial
        const { salt, hash } = hashPassword('vipuri2026');
        this.data.users.push({
          username: 'manager_staff',
          fullName: 'Manager Principal',
          discordId: 'vipuri_staff',
          role: 'manager',
          status: 'approved',
          salt: salt,
          hash: hash,
          createdAt: new Date().toISOString()
        });
        this.data.rules = defaultRules;
        this.data.logs = [];
        this.data.applications = [];
        this.data.appStatus = { police: true, smurd: true, staff: true, gang: true };
        this.data.applicationLogs = [];
        this.save();
        console.log("Database seeded successfully with default manager_staff user.");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error("Error saving database:", error);
    }
  }

  verifyPassword(password, salt, hash) {
    const testHash = crypto.createHash('sha256').update(password + salt).digest('hex');
    return testHash === hash;
  }

  logAction(username, fullName, action) {
    if (!this.data.logs) {
      this.data.logs = [];
    }
    this.data.logs.unshift({
      timestamp: new Date().toISOString(),
      username,
      fullName,
      action
    });
    if (this.data.logs.length > 150) {
      this.data.logs = this.data.logs.slice(0, 150);
    }
    this.save();
  }

  getLogs() {
    return this.data.logs || [];
  }

  // User Management
  getUser(username) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  createUser(username, fullName, discordId, password, requestedRole) {
    if (this.getUser(username)) {
      return { success: false, message: "Utilizatorul există deja!" };
    }

    const validRoles = ['admin', 'manager', 'tester-pd', 'tester-smurd', 'tester-staff', 'manager-mafii'];
    const assignedRole = validRoles.includes(requestedRole) ? requestedRole : 'admin';

    const { salt, hash } = hashPassword(password);
    const newUser = {
      username: username.toLowerCase().trim(),
      fullName: fullName.trim(),
      discordId: discordId.trim(),
      role: assignedRole,
      status: 'pending',
      salt: salt,
      hash: hash,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.logAction(newUser.username, newUser.fullName, `S-a înregistrat pe site cu rolul solicitat "${assignedRole.toUpperCase()}" și așteaptă aprobarea.`);
    this.save();
    return { success: true, user: newUser };
  }

  approveUser(username, adminUser, adminName) {
    const user = this.getUser(username);
    if (!user) return { success: false, message: "Utilizatorul nu a fost găsit." };
    
    user.status = 'approved';
    this.logAction(adminUser, adminName, `A aprobat cererea de staff a utilizatorului "${username}" (${user.role.toUpperCase()}).`);
    this.save();
    return { success: true, message: `Utilizatorul ${username} a fost aprobat.` };
  }

  rejectUser(username, adminUser, adminName) {
    const index = this.data.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (index === -1) return { success: false, message: "Utilizatorul nu a fost găsit." };
    
    const user = this.data.users[index];
    this.data.users.splice(index, 1);
    this.logAction(adminUser, adminName, `A respins și șters cererea de înregistrare a utilizatorului "${username}".`);
    this.save();
    return { success: true, message: `Înregistrarea utilizatorului ${user.username} a fost respinsă.` };
  }

  getPendingUsers() {
    return this.data.users.filter(u => u.status === 'pending').map(u => ({
      username: u.username,
      fullName: u.fullName,
      discordId: u.discordId,
      role: u.role,
      createdAt: u.createdAt
    }));
  }

  getActiveStaff() {
    return this.data.users.filter(u => u.status === 'approved').map(u => ({
      username: u.username,
      fullName: u.fullName,
      discordId: u.discordId,
      role: u.role,
      createdAt: u.createdAt
    }));
  }

  updateUserRole(username, newRole, adminUser, adminName) {
    const user = this.getUser(username);
    if (!user) return { success: false, message: "Utilizatorul nu a fost găsit." };
    
    const validRoles = ['admin', 'manager', 'tester-pd', 'tester-smurd', 'tester-staff', 'manager-mafii'];
    if (!validRoles.includes(newRole)) {
      return { success: false, message: "Rol invalid. Alege un rol valid din sistem." };
    }
    
    const oldRole = user.role;
    user.role = newRole;
    this.logAction(adminUser, adminName, `A schimbat rolul utilizatorului "${username}" din ${oldRole.toUpperCase()} în ${newRole.toUpperCase()}.`);
    this.save();
    return { success: true, message: `Rolul utilizatorului ${username} a fost schimbat în ${newRole}.` };
  }

  deleteUser(username, adminUser, adminName) {
    const index = this.data.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (index === -1) return { success: false, message: "Utilizatorul nu a fost găsit." };
    
    const approvedManagers = this.data.users.filter(u => u.role === 'manager' && u.status === 'approved');
    if (this.data.users[index].role === 'manager' && approvedManagers.length <= 1) {
      return { success: false, message: "Nu poți șterge ultimul Manager activ din sistem!" };
    }

    const user = this.data.users[index];
    this.data.users.splice(index, 1);
    this.logAction(adminUser, adminName, `A eliminat complet din staff utilizatorul "${username}".`);
    this.save();
    return { success: true, message: `Utilizatorul staff a fost eliminat.` };
  }

  // Rules management
  getRules() {
    return this.data.rules;
  }

  updateCategoryContent(categoryKey, content, adminUser, adminName) {
    if (!this.data.rules[categoryKey]) {
      return { success: false, message: `Categoria '${categoryKey}' nu există.` };
    }

    this.data.rules[categoryKey].content = content;
    this.logAction(adminUser, adminName, `A modificat textul regulamentului din categoria "${this.data.rules[categoryKey].title}".`);
    this.save();
    return { success: true, message: "Regulamentul a fost actualizat cu succes." };
  }

  // Application Gestiune
  getApplicationsStatus() {
    if (!this.data.appStatus) {
      this.data.appStatus = { police: true, smurd: true, staff: true, gang: true };
    }
    return this.data.appStatus;
  }

  submitApplication(type, formData) {
    if (!this.data.applications) {
      this.data.applications = [];
    }
    
    const status = this.getApplicationsStatus();
    if (!status[type]) {
      return { success: false, message: "Aplicațiile pentru această secțiune sunt momentan închise." };
    }

    const newApp = {
      id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      formData,
      processedBy: null,
      processedByName: null,
      processedAt: null,
      rejectReason: null
    };

    this.data.applications.push(newApp);
    
    let applicantName = "Jucător Anonim";
    if (type === 'police' && formData.numeOoc) applicantName = formData.numeOoc;
    else if (type === 'smurd' && formData.idJoc) applicantName = `ID: ${formData.idJoc}`;
    else if (type === 'staff' && formData.numeVarsta) applicantName = formData.numeVarsta;
    else if (type === 'gang' && formData.numeOoc) applicantName = formData.numeOoc;

    this.logApplicationAction(type, applicantName, 'pending', 'Sistem', `Aplicație trimisă.`);
    this.save();
    return { success: true, application: newApp };
  }

  toggleApplicationStatus(type, isOpen, adminUser, adminName) {
    if (!this.data.appStatus) {
      this.data.appStatus = { police: true, smurd: true, staff: true, gang: true };
    }
    
    this.data.appStatus[type] = isOpen;
    
    const statusText = isOpen ? "DESCHISE" : "ÎNCHISE";
    this.logAction(adminUser, adminName, `A schimbat statusul aplicațiilor pentru ${type.toUpperCase()} în ${statusText}.`);
    this.save();
    return { success: true, status: this.data.appStatus };
  }

  processApplication(appId, status, reason, adminUser, adminName) {
    if (!this.data.applications) {
      this.data.applications = [];
    }

    const app = this.data.applications.find(a => a.id === appId);
    if (!app) {
      return { success: false, message: "Aplicația nu a fost găsită." };
    }

    if (app.status !== 'pending') {
      return { success: false, message: "Aplicația a fost deja procesată." };
    }

    app.status = status; // 'accepted' or 'rejected'
    app.processedBy = adminUser;
    app.processedByName = adminName;
    app.processedAt = new Date().toISOString();
    if (status === 'rejected') {
      app.rejectReason = reason || "Nespecificat";
    }

    let applicantName = "Jucător";
    const type = app.type;
    const formData = app.formData;
    if (type === 'police' && formData.numeOoc) applicantName = formData.numeOoc;
    else if (type === 'smurd' && formData.idJoc) applicantName = `ID: ${formData.idJoc}`;
    else if (type === 'staff' && formData.numeVarsta) applicantName = formData.numeVarsta;
    else if (type === 'gang' && formData.numeOoc) applicantName = formData.numeOoc;

    const actionText = status === 'accepted' ? "Acceptat" : `Respins (Motiv: ${reason || 'Nespecificat'})`;
    this.logApplicationAction(type, applicantName, status, adminName, actionText);
    this.logAction(adminUser, adminName, `A ${status === 'accepted' ? 'acceptat' : 'respins'} aplicația (${type.toUpperCase()}) lui "${applicantName}".`);
    
    this.save();
    return { success: true, application: app };
  }

  logApplicationAction(appType, applicantName, status, processedBy, reason) {
    if (!this.data.applicationLogs) {
      this.data.applicationLogs = [];
    }
    this.data.applicationLogs.unshift({
      timestamp: new Date().toISOString(),
      appType,
      applicantName,
      status,
      processedBy,
      reason
    });
    
    if (this.data.applicationLogs.length > 200) {
      this.data.applicationLogs = this.data.applicationLogs.slice(0, 200);
    }
  }

  getApplicationLogs() {
    return this.data.applicationLogs || [];
  }

  getApplications() {
    return this.data.applications || [];
  }

  getApplicationQuestions(type) {
    if (!this.data.applicationQuestions) {
      this.data.applicationQuestions = defaultQuestions;
    }
    return this.data.applicationQuestions[type] || [];
  }

  updateApplicationQuestions(type, questions, adminUser, adminName) {
    if (!this.data.applicationQuestions) {
      this.data.applicationQuestions = defaultQuestions;
    }
    this.data.applicationQuestions[type] = questions;
    
    let friendlyName = '';
    if (type === 'smurd') friendlyName = 'SMURD';
    else if (type === 'police') friendlyName = 'Poliție (PD)';
    else if (type === 'staff') friendlyName = 'Staff Server';
    else if (type === 'gang') friendlyName = 'Gang/Mafii';

    this.logAction(adminUser, adminName, `A modificat întrebările de aplicație pentru secțiunea ${friendlyName}.`);
    this.save();
    return { success: true, message: `Întrebările pentru ${friendlyName} au fost actualizate cu succes.` };
  }
}

module.exports = new Database();
