
const apiKey = '2dec94d1cb0a60658b91947e2a4cfeec';

const form = document.getElementById('search-form');
const input = document.getElementById('search');

const searchCity = async (city) => {
  console.log("CIUDAD BUSCADA:", city);

  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`
    );

    const data = await res.json();

    console.log("RESULTADO API:", data);

  } catch (error) {
    console.error("Error buscando ciudad:", error);
  }
};

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const city = input.value.trim();

  if (!city) return;

  console.log("CLICK → ciudad enviada:", city);

  searchCity(city);

  input.value = '';
});