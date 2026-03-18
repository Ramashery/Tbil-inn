/* ═══════════════════════════════════════════════════════════
   TBIL INN — main.js
   Shared Firebase client + helpers for index / room / service
   ═══════════════════════════════════════════════════════════ */

import { initializeApp }  from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getFirestore,
  doc, collection,
  getDoc, getDocs,
  query, where, orderBy
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// ─── Firebase config ───────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyB8CuIy_VVIopXlYtscG366KoEqOJ0Vt1w",
  authDomain:        "tbil-inn.firebaseapp.com",
  projectId:         "tbil-inn",
  storageBucket:     "tbil-inn.firebasestorage.app",
  messagingSenderId: "460166841090",
  appId:             "1:460166841090:web:371dffb9c9c1d314c2381b",
  measurementId:     "G-8ET4GLHRT3"
};

export const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);

// ─── Language ──────────────────────────────────────────────
const SUPPORTED_LANGS = ['en', 'ru', 'ka'];
const DEFAULT_LANG    = 'en';

export function getCurrentLang() {
  const stored = localStorage.getItem('tbil_lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  const browser = navigator.language?.slice(0, 2);
  if (SUPPORTED_LANGS.includes(browser)) return browser;
  return DEFAULT_LANG;
}

export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  localStorage.setItem('tbil_lang', lang);
  window.location.reload();
}

/** Pick the right language string from a {en,ru,ka} map */
export function t(map, lang) {
  if (!map) return '';
  return map[lang] || map[DEFAULT_LANG] || '';
}

// ─── Firestore helpers ─────────────────────────────────────

/** Fetch site_config/homepage */
export async function getHomepage() {
  const snap = await getDoc(doc(db, 'site_config', 'homepage'));
  return snap.exists() ? snap.data() : null;
}

/** Fetch site_config/contacts */
export async function getContacts() {
  const snap = await getDoc(doc(db, 'site_config', 'contacts'));
  return snap.exists() ? snap.data() : null;
}

/** Fetch all LIVE rooms ordered by `order` */
export async function getLiveRooms() {
  const q = query(
    collection(db, 'rooms'),
    where('status', '==', 'live'),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Fetch a single room by Firestore document ID */
export async function getRoomById(id) {
  const snap = await getDoc(doc(db, 'rooms', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Fetch all LIVE services ordered by `order` */
export async function getLiveServices() {
  const q = query(
    collection(db, 'services'),
    where('status', '==', 'live'),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Fetch a single service by Firestore document ID */
export async function getServiceById(id) {
  const snap = await getDoc(doc(db, 'services', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ─── Language switcher UI ──────────────────────────────────
/**
 * Inject a language switcher into any element.
 * Usage: injectLangSwitcher('#lang-switcher-el', currentLang)
 */
export function injectLangSwitcher(selector, currentLang) {
  const el = document.querySelector(selector);
  if (!el) return;
  const labels = { en: 'EN', ru: 'RU', ka: 'KA' };
  el.innerHTML = SUPPORTED_LANGS.map(l =>
    `<button class="lang-btn${l === currentLang ? ' active' : ''}"
       onclick="window.tbil.setLang('${l}')">${labels[l]}</button>`
  ).join('');
}

// Expose setLang globally so onclick= attributes work
window.tbil = { setLang };
