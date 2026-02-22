// GoalZone v2 — Auth Module
// Developed by Mohammed Gharouadi ©2026

// ── Firebase Config ── (Replace with your values)
const FB_CFG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

let auth = null, db = null, me = null;

try {
  firebase.initializeApp(FB_CFG);
  auth = firebase.auth();
  db   = firebase.firestore();
} catch(e) { console.warn('[Firebase] Not configured —', e.message); }

// ── Modal helpers ────────────────────────────
const openModal  = id => document.getElementById(id)?.classList.add('show');
const closeModal = id => document.getElementById(id)?.classList.remove('show');

function openLoginModal()    { closeModal('register-modal'); openModal('login-modal'); }
function openRegisterModal() { closeModal('login-modal');    openModal('register-modal'); }
function openVIPModal()      { openModal('vip-modal'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) closeModal(e.target.id);
});

// ── Google Sign-In ───────────────────────────
async function signInGoogle() {
  if (!auth) { toast('⚠️ Firebase غير مفعل', 'err'); return; }
  try {
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    closeModal('login-modal'); closeModal('register-modal');
    toast('✅ ' + t('signin'), 'ok');
  } catch(e) { toast('❌ ' + e.message, 'err'); }
}

// ── Email Sign-In ────────────────────────────
async function signInEmail() {
  if (!auth) { toast('⚠️ Firebase غير مفعل', 'err'); return; }
  const email = document.getElementById('li-email')?.value;
  const pass  = document.getElementById('li-pass')?.value;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    closeModal('login-modal');
    toast('✅ ' + t('signin'), 'ok');
  } catch(e) { toast('❌ ' + e.message, 'err'); }
}

// ── Register ─────────────────────────────────
async function registerUser() {
  if (!auth) { toast('⚠️ Firebase غير مفعل', 'err'); return; }
  const name  = document.getElementById('reg-name')?.value;
  const email = document.getElementById('reg-email')?.value;
  const pass  = document.getElementById('reg-pass')?.value;
  try {
    const c = await auth.createUserWithEmailAndPassword(email, pass);
    await c.user.updateProfile({ displayName: name });
    if (db) await db.collection('users').doc(c.user.uid).set({
      name, email, createdAt: new Date(), isVIP: false, favTeams: []
    });
    closeModal('register-modal');
    toast('✅ تم إنشاء الحساب', 'ok');
  } catch(e) { toast('❌ ' + e.message, 'err'); }
}

// ── Sign Out ─────────────────────────────────
async function signOut() {
  if (auth) await auth.signOut();
  toast('👋 تم تسجيل الخروج', 'ok');
}

// ── Auth State ───────────────────────────────
if (auth) {
  auth.onAuthStateChanged(user => {
    me = user;
    updateAuthUI(user);
  });
}

function updateAuthUI(user) {
  const area = document.getElementById('auth-area');
  if (!area) return;
  if (user) {
    const init = (user.displayName||user.email||'U')[0].toUpperCase();
    area.innerHTML = `
      <div style="position:relative">
        <button class="avatar-btn" onclick="this.nextElementSibling.classList.toggle('show')">${init}</button>
        <div class="user-menu">
          <a href="#">👤 ${user.displayName||'حسابي'}</a>
          <a href="#">⭐ المفضلة</a>
          <a href="#" onclick="openVIPModal()">👑 VIP</a>
          <a href="#" onclick="signOut()">🚪 خروج</a>
        </div>
      </div>`;
  } else {
    area.innerHTML = `<button class="btn-signin" onclick="openLoginModal()">${t('signin')}</button>`;
  }
}

// ── Toast ────────────────────────────────────
function toast(msg, type='') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className   = `toast show${type?' '+type:''}`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ── Notifications ────────────────────────────
function reqNotif() {
  if (!('Notification' in window)) { toast('المتصفح لا يدعم الإشعارات','err'); return; }
  Notification.requestPermission().then(p => {
    if (p==='granted') {
      localStorage.setItem('gz_notif','1');
      dismissNotif();
      toast('🔔 تم تفعيل الإشعارات', 'ok');
      new Notification('GoalZone ⚽',{body:'ستصلك إشعارات المباريات والأهداف!'});
    }
  });
}
function dismissNotif() { document.getElementById('notif-bar')?.classList.remove('show'); }
