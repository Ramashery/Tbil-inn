/* ═══════════════════════════════════════════════════════════
   TBIL INN — main.js  v3
   Firebase Hosting edition — no /Tbil-inn base path needed.
   URLs are clean:  /rooms/the-courtyard-suite/
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

export function t(map, lang) {
  if (!map) return '';
  return map[lang] || map[DEFAULT] || '';
}

// ─── Slug helper ───────────────────────────────────────────
export function toSlug(str = '') {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-') || str;
}

// ─── URL helpers ───────────────────────────────────────────
// On Firebase Hosting there is no repo-name prefix.
// URLs are simply:  /rooms/the-courtyard-suite/
export function roomUrl(room) {
  return `/rooms/${room.slug || room.id}/`;
}

export function serviceUrl(svc) {
  return `/services/${svc.slug || svc.id}/`;
}

// ─── Firestore helpers ─────────────────────────────────────

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

export async function getRoomById(idOrSlug) {
  // Try direct Firestore doc ID first
  const snap = await getDoc(doc(db, 'rooms', idOrSlug));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  // Fallback: scan for slug field match
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

// ─── Global ────────────────────────────────────────────────
window.tbil = { setLang };
