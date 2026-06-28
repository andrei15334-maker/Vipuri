const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiune securizată
app.use(session({
  secret: 'vipuri_roleplay_secret_key_2026_super_secure',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 ore
    secure: false, // set to true if using https
    httpOnly: true
  }
}));

// Servire fișiere statice din folderul public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de verificare autentificare și roluri
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Neautorizat. Vă rugăm să vă conectați." });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || (req.session.userRole !== 'admin' && req.session.userRole !== 'manager')) {
    return res.status(403).json({ success: false, message: "Acces refuzat. Necesită grad de Admin." });
  }
  next();
}

function requireManager(req, res, next) {
  if (!req.session.userId || req.session.userRole !== 'manager') {
    return res.status(403).json({ success: false, message: "Acces refuzat. Necesită grad de Manager Staff." });
  }
  next();
}

function requireStaff(req, res, next) {
  const validRoles = ['admin', 'manager', 'tester-pd', 'tester-smurd', 'tester-staff', 'manager-mafii'];
  if (!req.session.userId || !validRoles.includes(req.session.userRole)) {
    return res.status(403).json({ success: false, message: "Acces refuzat. Necesită grad de Staff." });
  }
  next();
}

// ----------------------------------------------------
// RUTĂ AUTENTIFICARE (AUTH API)
// ----------------------------------------------------

// Înregistrare
app.post('/api/auth/register', (req, res) => {
  const { username, fullName, discordId, password, requestedRole } = req.body;
  
  if (!username || !fullName || !discordId || !password) {
    return res.status(400).json({ success: false, message: "Toate câmpurile sunt obligatorii." });
  }

  const result = db.createUser(username, fullName, discordId, password, requestedRole);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json({
    success: true,
    message: "Înregistrare reușită! Contul tău a fost trimis spre aprobare unui Manager Staff. Vei putea să te conectezi după ce contul este aprobat."
  });
});

// Autentificare
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Numele de utilizator și parola sunt obligatorii." });
  }

  const user = db.getUser(username);
  if (!user) {
    return res.status(401).json({ success: false, message: "Nume de utilizator sau parolă incorectă." });
  }

  if (user.status === 'pending') {
    return res.status(403).json({
      success: false,
      message: "Contul tău este încă în așteptare. Trebuie să fie aprobat de un Manager Staff înainte de a te conecta."
    });
  }

  const isMatch = db.verifyPassword(password, user.salt, user.hash);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Nume de utilizator sau parolă incorectă." });
  }

  // Setare sesiune
  req.session.userId = user.username;
  req.session.userName = user.fullName;
  req.session.userRole = user.role;

  res.json({
    success: true,
    message: "Autentificare reușită!",
    user: {
      username: user.username,
      fullName: user.fullName,
      role: user.role
    }
  });
});

// Deconectare
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: "Eroare la deconectare." });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: "Te-ai deconectat cu succes." });
  });
});

// Verificare status sesiune
app.get('/api/auth/status', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        username: req.session.userId,
        fullName: req.session.userName,
        role: req.session.userRole
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ----------------------------------------------------
// RUTĂ REGULAMENTE (RULES API)
// ----------------------------------------------------

// Obținerea tuturor regulamentelor
app.get('/api/rules', (req, res) => {
  res.json(db.getRules());
});

// Actualizare subcapitol (doar Admini sau Manageri)
app.post('/api/rules/update', requireAdmin, (req, res) => {
  const { categoryKey, chapterId, subchapterId, content } = req.body;

  if (!categoryKey || !chapterId || !subchapterId || content === undefined) {
    return res.status(400).json({ success: false, message: "Lipsesc parametri obligatorii." });
  }

  const result = db.updateSubchapterContent(categoryKey, chapterId, subchapterId, content, req.session.userId, req.session.userName);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json({ success: true, message: "Regulamentul a fost actualizat!" });
});

// ----------------------------------------------------
// RUTĂ MANAGEMENT STAFF (MANAGER ONLY API)
// ----------------------------------------------------

// Listare cereri în așteptare
app.get('/api/admin/users/pending', requireManager, (req, res) => {
  res.json({ success: true, users: db.getPendingUsers() });
});

// Aprobare cerere utilizator
app.post('/api/admin/users/approve', requireManager, (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, message: "Numele de utilizator este obligatoriu." });
  }

  const result = db.approveUser(username, req.session.userId, req.session.userName);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Respingere / ștergere cerere utilizator
app.post('/api/admin/users/reject', requireManager, (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, message: "Numele de utilizator este obligatoriu." });
  }

  const result = db.rejectUser(username, req.session.userId, req.session.userName);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Listare staff activ
app.get('/api/admin/users/list', requireManager, (req, res) => {
  res.json({ success: true, users: db.getActiveStaff() });
});

// Schimbare rol utilizator
app.post('/api/admin/users/update-role', requireManager, (req, res) => {
  const { username, newRole } = req.body;
  if (!username || !newRole) {
    return res.status(400).json({ success: false, message: "Username și noul rol sunt obligatorii." });
  }

  const result = db.updateUserRole(username, newRole, req.session.userId, req.session.userName);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Ștergere cont staff activ
app.post('/api/admin/users/delete', requireManager, (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, message: "Username este obligatoriu." });
  }

  const result = db.deleteUser(username, req.session.userId, req.session.userName);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Listare loguri activitate (accesibil pentru tot staff-ul)
app.get('/api/admin/logs', requireStaff, (req, res) => {
  res.json({ success: true, logs: db.getLogs() });
});

// ====================================================
// APIS PENTRU APLICAȚII JUCĂTORI (PUBLIC & ADMIN)
// ====================================================

// Status aplicații (public)
app.get('/api/applications/status', (req, res) => {
  res.json({ success: true, status: db.getApplicationsStatus() });
});

// Trimitere aplicație (public)
app.post('/api/applications/submit', (req, res) => {
  const { type, formData } = req.body;
  if (!type || !formData) {
    return res.status(400).json({ success: false, message: "Lipsesc parametri obligatorii." });
  }

  const result = db.submitApplication(type, formData);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Listare toate aplicațiile (doar staff)
app.get('/api/admin/applications', requireStaff, (req, res) => {
  res.json({ success: true, applications: db.getApplications() });
});

// Pornire / oprire aplicații (doar staff)
app.post('/api/admin/applications/toggle', requireStaff, (req, res) => {
  const { type, isOpen } = req.body;
  if (!type || isOpen === undefined) {
    return res.status(400).json({ success: false, message: "Lipsesc parametri." });
  }

  const result = db.toggleApplicationStatus(type, isOpen, req.session.userId, req.session.userName);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Procesare aplicație (Accept/Reject - doar staff)
app.post('/api/admin/applications/process', requireStaff, (req, res) => {
  const { appId, status, reason } = req.body;
  if (!appId || !status) {
    return res.status(400).json({ success: false, message: "Lipsesc parametri de procesare." });
  }

  const result = db.processApplication(appId, status, reason, req.session.userId, req.session.userName);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Listare loguri aplicații separate (doar staff)
app.get('/api/admin/applications/logs', requireStaff, (req, res) => {
  res.json({ success: true, logs: db.getApplicationLogs() });
});

// Pornire server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  VIPURI ROLEPLAY - Rules Portal is running!`);
  console.log(`  Localhost link: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
