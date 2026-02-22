// GoalZone v2 — i18n
// Developed by Mohammed Gharouadi ©2026

const LANGS = {
  ar: {
    home:'الرئيسية', live:'مباشر', news:'الأخبار', watch:'بث مباشر',
    signin:'تسجيل دخول', today:'اليوم', yesterday:'أمس', tomorrow:'غدًا',
    loading:'جارٍ التحميل...', no_matches:'لا توجد مباريات في هذا التاريخ',
    no_live:'لا توجد مباريات جارية الآن', live_label:'LIVE',
    ft:'انتهت', ht:'استراحة', ns_label:'قادمة',
    watch_btn:'شاهد', events:'أحداث المباراة', no_events:'لا توجد أحداث بعد',
    standings:'الترتيب', scorers:'الهدافون', vip:'اشترك VIP',
    all:'الكل', ucl:'أبطال أوروبا', epl:'الإنجليزية',
    laliga:'الإسبانية', bundesliga:'الألمانية', serie_a:'الإيطالية',
    ligue1:'الفرنسية', saudi:'السعودية',
    details:'تفاصيل كاملة', search_ph:'ابحث عن فريق أو مباراة...',
    notif_msg:'🔔 فعّل الإشعارات لتنبيهات الأهداف والمباريات!',
    notif_btn:'تفعيل', close:'إغلاق',
    goal:'هدف', yellow:'بطاقة صفراء', red:'بطاقة حمراء', sub:'تبديل',
    stats_tab:'إحصائيات', lineup_tab:'التشكيلة', events_tab:'الأحداث',
    register:'إنشاء حساب',
  },
  en: {
    home:'Home', live:'Live', news:'News', watch:'Live Stream',
    signin:'Sign In', today:'Today', yesterday:'Yesterday', tomorrow:'Tomorrow',
    loading:'Loading...', no_matches:'No matches on this date',
    no_live:'No live matches right now', live_label:'LIVE',
    ft:'Full Time', ht:'Half Time', ns_label:'Upcoming',
    watch_btn:'Watch', events:'Match Events', no_events:'No events yet',
    standings:'Standings', scorers:'Top Scorers', vip:'Subscribe VIP',
    all:'All', ucl:'Champions League', epl:'Premier League',
    laliga:'La Liga', bundesliga:'Bundesliga', serie_a:'Serie A',
    ligue1:'Ligue 1', saudi:'Saudi League',
    details:'Full Details', search_ph:'Search team or match...',
    notif_msg:'🔔 Enable notifications for goal & match alerts!',
    notif_btn:'Enable', close:'Close',
    goal:'Goal', yellow:'Yellow Card', red:'Red Card', sub:'Substitution',
    stats_tab:'Statistics', lineup_tab:'Lineup', events_tab:'Events',
    register:'Create Account',
  },
  fr: {
    home:'Accueil', live:'En Direct', news:'Actualités', watch:'Live Stream',
    signin:'Connexion', today:"Aujourd'hui", yesterday:'Hier', tomorrow:'Demain',
    loading:'Chargement...', no_matches:'Aucun match à cette date',
    no_live:'Aucun match en direct', live_label:'EN DIRECT',
    ft:'Terminé', ht:'Mi-temps', ns_label:'À venir',
    watch_btn:'Regarder', events:'Événements', no_events:'Pas encore d\'événements',
    standings:'Classement', scorers:'Buteurs', vip:'Abonnement VIP',
    all:'Tout', ucl:'Ligue des Champions', epl:'Premier League',
    laliga:'La Liga', bundesliga:'Bundesliga', serie_a:'Serie A',
    ligue1:'Ligue 1', saudi:'Saudi League',
    details:'Voir tout', search_ph:'Rechercher équipe ou match...',
    notif_msg:'🔔 Activez les notifications pour les alertes buts !',
    notif_btn:'Activer', close:'Fermer',
    goal:'But', yellow:'Carton Jaune', red:'Carton Rouge', sub:'Remplacement',
    stats_tab:'Statistiques', lineup_tab:'Composition', events_tab:'Événements',
    register:'Créer un compte',
  }
};

let lang = localStorage.getItem('gz_lang') || 'ar';

function t(k) { return (LANGS[lang] && LANGS[lang][k]) || LANGS.ar[k] || k; }

function setLang(l) {
  lang = l;
  localStorage.setItem('gz_lang', l);
  const isAr = l === 'ar';
  document.documentElement.setAttribute('lang', l);
  document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  document.querySelectorAll('[data-lang-btn]').forEach(b =>
    b.classList.toggle('on', b.dataset.langBtn === l));
  document.dispatchEvent(new Event('langchange'));
}

document.addEventListener('DOMContentLoaded', () => setLang(lang));
