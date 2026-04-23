export const translations = {
  es: {
    home: 'Inicio',
    cities: 'Ciudades',
    contact: 'Contacto',
    bannerTitle: 'Pogoda Teraz',
    bannerText: 'Consulta el clima de cualquier ciudad en segundos',
    searchPlaceholder: 'Buscar ciudad...',
    footerCopy: '© 2026 Pogoda Teraz. Todos los derechos reservados.',
    days: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  },

  en: {
    home: 'Home',
    cities: 'Cities',
    contact: 'Contact',
    bannerTitle: 'Pogoda Teraz',
    bannerText: 'Check the weather in any city in seconds',
    searchPlaceholder: 'Search city...',
    footerCopy: '© 2026 Pogoda Teraz. All rights reserved.',
    days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  },

  pl: {
    home: 'Strona główna',
    cities: 'Miasta',
    contact: 'Kontakt',
    bannerTitle: 'Pogoda Teraz',
    bannerText: 'Sprawdź pogodę w dowolnym mieście w kilka sekund',
    searchPlaceholder: 'Szukaj miasta...',
    footerCopy: '© 2026 Pogoda Teraz. Wszelkie prawa zastrzeżone.',
    days: ['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota']
  },

  de: {
    home: 'Startseite',
    cities: 'Städte',
    contact: 'Kontakt',
    bannerTitle: 'Pogoda Teraz',
    bannerText: 'Prüfen Sie das Wetter in jeder Stadt in Sekunden',
    searchPlaceholder: 'Stadt suchen...',
    footerCopy: '© 2026 Pogoda Teraz. Alle Rechte vorbehalten.',
    days: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']
  }
};


let currentLang = localStorage.getItem('idioma') || 'es';


let onChangeCallback = null;

export const onLanguageChange = (cb) => {
  onChangeCallback = cb;
};


export const setLanguage = (lang) => {
  currentLang = lang;
  localStorage.setItem("idioma", lang);

  applyLanguage();

  if (typeof onChangeCallback === 'function') {
    onChangeCallback(lang);
  }
};

export const getLanguage = () => currentLang;


export const getDayName = (index) => {
  return translations[currentLang].days[index];
};

export const applyLanguage = () => {
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    if (translations[currentLang]?.[key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  const search = document.getElementById('search');
  if (search) {
    search.placeholder = translations[currentLang].searchPlaceholder;
  }
};


export const initLanguagei18n = () => {
  const select = document.getElementById('language');

  const saved = localStorage.getItem('idioma') || 'es';
  select.value = saved;
  currentLang = saved;

  applyLanguage();

  select.addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });
};