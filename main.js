// Импорт Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Ваш конфиг Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB8CuIy_VVIOpXLYtscG366KoEqOJOVt1w",
    authDomain: "tbil-inn.firebaseapp.com",
    projectId: "tbil-inn",
    storageBucket: "tbil-inn.firebasestorage.app",
    messagingSenderId: "460166841090",
    appId: "1:460166841090:web:371dffb9c9c1d314c2381b"
};

// Инициализация
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, getDocs, doc, getDoc, setDoc, deleteDoc };

// Система языков
export const currentLang = localStorage.getItem('tbil-lang') || 'en';

export function setLanguage(lang) {
    localStorage.setItem('tbil-lang', lang);
    window.location.reload(); // Перезагружаем страницу для применения языка
}

// Привязываем функцию смены языка к глобальному объекту, чтобы вызывать из HTML
window.changeLanguage = setLanguage;

// Глобальная функция открытия мобильного меню
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu-overlay');
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
};
