/* ═══════════════════════════════════════════════════════════
   TBIL INN — main.js  v2
   ─────────────────────────────────────────────────────────
   KEY FIX:  Firestore queries with  where() + orderBy()
   require a composite index that must be manually created in
   the Firebase Console.  To avoid this we now fetch entire
   collections and filter / sort on the client.
   ═══════════════════════════════════════════════════════════ */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getFirestore,
  doc, collection,
  getDoc, getDocs
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
const SUPPORTED = ['en', 'ru', 'ka'];
const DEFAULT   = 'en';

export function getCurrentLang() {
  const s = localStorage.getItem('tbil_lang');
  if (s && SUPPORTED.includes(s)) return s;
  const b = navigator.language?.slice(0, 2);
  if (SUPPORTED.includes(b)) return b;
  return DEFAULT;
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  localStorage.setItem('tbil_lang', lang);
  window.location.reload();
}

/** Pick the right string from a {en,ru,ka} map */
export function t(map, lang) {
  if (!map) return '';
  return map[lang] || map[DEFAULT] || '';
}

// ─── URL helpers ───────────────────────────────────────────
/** "The Courtyard Suite" → "the-courtyard-suite" */
export function toSlug(str = '') {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-') || str;
}

/**
 * Detect the repo sub-path on GitHub Pages.
 * https://ramashery.github.io/Tbil-inn  →  "/Tbil-inn"
 * localhost  →  ""
 */
export function basePath() {
  const segs = window.location.pathname.split('/').filter(Boolean);
  // If first segment has no dot (not a file) and we're on github.io
  if (window.location.hostname.endsWith('github.io') && segs.length) {
    return '/' + segs[0];
  }
  return '';
}

/** URL for a room page:  /Tbil-inn/rooms/<slug-or-id>/ */
export function roomUrl(room) {
  const slug = room.slug || room.id;
  return `${basePath()}/rooms/${slug}/`;
}

/** URL for a service page:  /Tbil-inn/services/<slug-or-id>/ */
export function serviceUrl(svc) {
  const slug = svc.slug || svc.id;
  return `${basePath()}/services/${slug}/`;
}

// ─── Firestore helpers ─────────────────────────────────────
// Fetching whole collection + client filter avoids composite indexes.

export async function getHomepage() {
  const snap = await getDoc(doc(db, 'site_config', 'homepage'));
  return snap.exists() ? snap.data() : null;
}

export async function getContacts() {
  const snap = await getDoc(doc(db, 'site_config', 'contacts'));
  return snap.exists() ? snap.data() : null;
}

export async function getAllRooms() {
  const snap = await getDocs(collection(db, 'rooms'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getLiveRooms() {
  return (await getAllRooms()).filter(r => r.status === 'live');
}

/** Lookup by Firestore doc ID or by the `slug` field */
export async function getRoomById(idOrSlug) {
  const snap = await getDoc(doc(db, 'rooms', idOrSlug));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  const all = await getAllRooms();
  return all.find(r => r.slug === idOrSlug) ?? null;
}

export async function getAllServices() {
  const snap = await getDocs(collection(db, 'services'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getLiveServices() {
  return (await getAllServices()).filter(s => s.status === 'live');
}

export async function getServiceById(idOrSlug) {
  const snap = await getDoc(doc(db, 'services', idOrSlug));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  const all = await getAllServices();
  return all.find(s => s.slug === idOrSlug) ?? null;
}

// ─── Global exposure ───────────────────────────────────────
window.tbil = { setLang };
