const apiKey = '2dec94d1cb0a60658b91947e2a4cfeec';


let cities = [];
let darkMode = false;
let loading = false;

const themeBtn = document.getElementById("theme-toggle");


const getWeatherIcon = (icon) => {
  if (!icon) return "./icons/soleado.png";

  const type = icon.slice(0, 2);
  const isNight = icon.includes("n");

  if (type === "01") {
    return isNight
      ? "./icons/luna-creciente.png"
      : "./icons/soleado.png";
  }

  if (["09", "10"].includes(type)) return "./icons/nevando.png";
  if (type === "11") return "./icons/tormenta.png";
  if (type === "13") return "./icons/nieve.png";
  if (type === "50") return "./icons/soleado.png";

  return "./icons/soleado.png";
};

function getWeatherImage(icon) {
  if (!icon) return "";

  const type = icon.slice(0, 2);
  const isNight = icon.includes("n");

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

  const fallbackDay = imagesDay["01"];
  const fallbackNight = imagesNight["01"];

  return isNight
    ? (imagesNight[type] || fallbackNight)
    : (imagesDay[type] || fallbackDay);
}


function applyTheme() {
  document.documentElement.classList.toggle("dark", darkMode);

  if (themeBtn) {
    themeBtn.textContent = darkMode ? "☀️" : "🌙";
  }

  renderGrid();
}

function loadTheme() {
  darkMode = localStorage.getItem("theme") === "dark";
  applyTheme();
}

if (themeBtn) {
  themeBtn.addEventListener("click", function () {
    darkMode = !darkMode;
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    applyTheme();
  });
}


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

  } catch (error) {
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

    const dailyMap = new Map();

    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          temps: [],
          icons: []
        });
      }

      const day = dailyMap.get(date);
      day.temps.push(item.main.temp);
      day.icons.push(item.weather[0].icon);
    });

    const daily = Array.from(dailyMap.values()).slice(0, 5).map(day => {
      const avgTemp =
        day.temps.reduce((a, b) => a + b, 0) / day.temps.length;

      const icon = day.icons.sort(
        (a, b) =>
          day.icons.filter(v => v === b).length -
          day.icons.filter(v => v === a).length
      )[0];

      return {
        temp: avgTemp,
        icon
      };
    });

    const city = {
      id: Date.now(),
      name,
      icon: data.list[0].weather[0].icon,
      daily
    };

    renderGrid(city);

  } catch (error) {
    loading = false;
    renderGrid();
  }
}


function toggleCity(city) {
  const index = cities.findIndex(c =>
    c.name.toLowerCase() === city.name.toLowerCase()
  );

  if (index === -1) cities.push(city);
  else cities.splice(index, 1);

  localStorage.setItem("cities", JSON.stringify(cities));
  renderGrid();
}

function createCard(city) {
  const image = getWeatherImage(city.icon);

  const isSaved = cities.some(c =>
    c.name.toLowerCase() === city.name.toLowerCase()
  );

  const textColor = darkMode ? "text-white" : "text-black";
  const cardBg = darkMode ? "bg-slate-900" : "bg-white";

  const borderColor = darkMode
    ? "border border-white/20"
    : "border border-gray-300";

  const daysHTML = city.daily.map(day => `
    <div class="flex items-center gap-2 px-2 py-1 rounded-lg">
      <img src="${getWeatherIcon(day.icon)}" class="w-5 h-5" />
      <span class="text-sm font-semibold">${Math.round(day.temp)}°C</span>
    </div>
  `).join("");

  return `
    <div class="rounded-3xl ${borderColor} ${cardBg} ${textColor}
      p-9 pt-12 shadow-md ring-1 ring-black/5 dark:ring-white/10
      transition-all duration-300 hover:scale-[1.01] mt-9">

      <div class="flex justify-between items-start mt-10 px-2 pt-5">

        <h5 class="font-bold uppercase tracking-wide text-sm leading-tight pt-9 pr-3">
          ${city.name}
        </h5>

        <button
          class="fav-btn text-sm leading-none px-4 ${isSaved ? "text-red-500" : "text-yellow-400"}"
          data-city='${encodeURIComponent(JSON.stringify(city))}'
        >
          ${isSaved ? "🗑️" : "⭐"}
        </button>

      </div>

      <div class="mb-5">
        <img src="${image}" class="w-full h-36 object-cover rounded-xl">
      </div>

      <div class="grid grid-cols-3 gap-3 px-2">
        ${daysHTML}
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
    grid.innerHTML = `
      <div class="col-span-full h-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl"></div>
    `;
    return;
  }

  if (currentCity) grid.innerHTML += createCard(currentCity);

  cities.forEach(city => {
    if (
      currentCity &&
      city.name.toLowerCase() === currentCity.name.toLowerCase()
    ) return;

    grid.innerHTML += createCard(city);
  });
}


const form = document.getElementById("search-form");
const input = document.getElementById("search");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const city = input.value.trim();

    if (city) {
      searchCity(city);
      input.value = "";
    }
  });
}


document.addEventListener("click", function (e) {
  if (e.target.classList.contains("fav-btn")) {
    const city = JSON.parse(decodeURIComponent(e.target.dataset.city));
    toggleCity(city);
  }
});


loadTheme();
renderGrid();