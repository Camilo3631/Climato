import {
  getLanguage,
  getDayName,
  initLanguagei18n,
  onLanguageChange
} from "./i18n.js";

const apiKey = '2dec94d1cb0a60658b91947e2a4cfeec';


let cities = [];
let darkMode = false;
let loading = false;

const themeBtn = document.getElementById("theme-toggle");


const getWeatherIcon = (icon) => {
    if (!icon) return './icons/sunny.png';

    const type = icon.slice(0, 2);
    const isNight = icon.endsWith('n')

    if (type === '01') return isNight ? './icons/waxing-crescent.png' : './icons/sunny.png';

    if (['02', '03', '04'].includes(type))
        return isNight
        ? './icons/cloudy-night.png'
        : './icons/cloudy.png';

    if (['09', '10'].includes(type))
      return './icons/rainy-night.png';

    if (type === '11') return './icons/storm.png';
    if (type === '13') return './icons/snow.png';
    if (type === '15') return './icons/rain.png';
    if (type === '50') return './icons/cloudy-day.png';

    return './icons/sunny.png'
};



function getWeatherImage(icon) {
  if (!icon) return "./img/sol.jpg";

  const type = icon.slice(0, 2);
  const isNight = icon.endsWith("n");

  const imagesDay = {
    "01": "./img/sol.jpg",
    "02": "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg",
    "09": "./img/lluvia.jpg",
    "10": "./img/lluvia.jpg",
    "11": "./img/tormenta.jpg",
    "13": "./img/nieve.jpg"
  };

  const imagesNight = {
    "01": "https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg",
    "02": "./img/noche.jpg",
    "03": "./img/noche.jpg",
    "04": "./img/noche.jpg",
    "09": "./img/lluvia.jpg",
    "10": "./img/lluvia.jpg",
    "11": "./img/tormenta.jpg",
    "13": "./img/nieve.jpg"
  };

  return isNight
    ? (imagesNight[type] || imagesNight["01"])
    : (imagesDay[type] || imagesDay["01"]);
}


function applyTheme() {
  document.documentElement.classList.toggle("dark", darkMode);
  if (themeBtn) themeBtn.textContent = darkMode ? "🌙" : "☀️";
  renderGrid();
}

function loadTheme() {
  darkMode = localStorage.getItem("theme") === "dark";
  applyTheme();
}

themeBtn?.addEventListener("click", function () {
  darkMode = !darkMode;
  localStorage.setItem("theme", darkMode ? "dark" : "light");
  applyTheme();
});


async function searchCity(cityName) {
  try {
    loading = true;
    renderGrid();

    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`
    );

    const geoData = await geoRes.json();

    if (!geoData.length) {
      loading = false;
      renderGrid();
      return;
    }

    await getWeather(geoData[0].name, geoData[0].lat, geoData[0].lon);

  } catch {
    loading = false;
    renderGrid();
  }
}


async function getWeather(name, lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );

    const data = await res.json();
    loading = false;

    const map = [];
    const seen = new Set();

    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];

      if (!seen.has(date)) {
        seen.add(date);

        map.push({
          date,
          dayIndex: new Date(item.dt_txt).getDay(),
          hours: []
        });
      }

      const current = map.find(d => d.date === date);

      current.hours.push({
        temp: item.main.temp,
        icon: item.weather[0].icon,
        hour: item.dt_txt.split(" ")[1].slice(0, 5)
      });
    });

    const city = {
      id: Date.now(),
      name,
      icon: data.list[0].weather[0].icon,
      daily: map.slice(0, 4)
    };

    renderGrid(city);

  } catch {
    loading = false;
    renderGrid();
  }
}


function toggleCity(city) {
  const index = cities.findIndex(
    c => c.name.toLowerCase() === city.name.toLowerCase()
  );

  if (index === -1) cities.push(city);
  else cities.splice(index, 1);

  localStorage.setItem("cities", JSON.stringify(cities));
  renderGrid();
}


function createCard(city) {
  const image = getWeatherImage(city.icon);

  const isSaved = cities.some(
    c => c.name.toLowerCase() === city.name.toLowerCase()
  );

  const daysHTML = city.daily.map(d => {

    const hoursHTML = d.hours.slice(0, 5).map(h => `
      <div class="flex flex-col items-center text-white min-w-[50px]">
        <span class="text-[5px] opacity-70">${h.hour}</span>
        <img src="${getWeatherIcon(h.icon)}" class="w-5 h-5 my-1" />
        <span class="text-sm font-medium">${Math.round(h.temp)}°</span>
      </div>
    `).join("");

    return `
      <div class="mb-3">
        <div class="text-xl opacity-60 mb-1 font-semibold">
          ${getDayName(d.dayIndex)}
        </div>
        <div class="flex gap-3 overflow-hidden">
          ${hoursHTML}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div style="border-radius:20px;overflow:hidden;margin-top:24px;margin-bottom:12px;height:440px;position:relative;">

      <img src="${image}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">

      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(12px);"></div>

      <div style="position:relative;z-index:10;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:20px;color:white;">

        <div style="display:flex;justify-content:space-between;">
          <h2 class="text-4xl font-bold">${city.name}</h2>

          <button class="heart-btn"
            data-city='${encodeURIComponent(JSON.stringify(city))}'>
            ${isSaved ? "❤️" : "🤍"}
          </button>
        </div>

        <div style="font-size:29px;">
          ${Math.round(city.daily[0].hours[0].temp)}°
        </div>

        <div>${daysHTML}</div>

      </div>
    </div>
  `;
}

function renderGrid(currentCity = null) {
  const grid = document.getElementById("grid-city-weather");
  if (!grid) return;

  const data = localStorage.getItem("cities");
  if (data) cities = JSON.parse(data);

  grid.innerHTML = "";

  if (loading) {
    grid.innerHTML = `<div class="h-32 bg-gray-300 animate-pulse rounded-3xl"></div>`;
    return;
  }

  if (currentCity) grid.innerHTML += createCard(currentCity);

  cities.forEach(city => {
    if (currentCity && city.name === currentCity.name) return;
    grid.innerHTML += createCard(city);
  });
}


document.getElementById("search-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("search");
  if (input.value.trim()) {
    searchCity(input.value.trim());
    input.value = "";
  }
});

document.addEventListener("click", e => {
  if (e.target.classList.contains("heart-btn")) {
    const city = JSON.parse(decodeURIComponent(e.target.dataset.city));
    toggleCity(city);
  }
});



loadTheme();
initLanguagei18n();


onLanguageChange(() => {
  renderGrid();
});

renderGrid();