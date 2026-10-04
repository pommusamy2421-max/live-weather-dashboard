// ============================================
// Live Weather Dashboard
// Fetch API + Async/Await
// ============================================

// HTML Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorMessage = document.getElementById("errorMessage");
const loading = document.getElementById("loading");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");

const forecastContainer =
    document.getElementById("forecastContainer");


// ============================================
// Weather Code Information
// ============================================

function getWeatherInfo(code) {

    const weatherCodes = {

        0: {
            description: "Clear sky",
            icon: "☀️"
        },

        1: {
            description: "Mainly clear",
            icon: "🌤️"
        },

        2: {
            description: "Partly cloudy",
            icon: "⛅"
        },

        3: {
            description: "Overcast",
            icon: "☁️"
        },

        45: {
            description: "Fog",
            icon: "🌫️"
        },

        48: {
            description: "Rime fog",
            icon: "🌫️"
        },

        51: {
            description: "Light drizzle",
            icon: "🌦️"
        },

        53: {
            description: "Moderate drizzle",
            icon: "🌦️"
        },

        55: {
            description: "Dense drizzle",
            icon: "🌧️"
        },

        61: {
            description: "Slight rain",
            icon: "🌦️"
        },

        63: {
            description: "Moderate rain",
            icon: "🌧️"
        },

        65: {
            description: "Heavy rain",
            icon: "🌧️"
        },

        71: {
            description: "Slight snow",
            icon: "🌨️"
        },

        73: {
            description: "Moderate snow",
            icon: "❄️"
        },

        75: {
            description: "Heavy snow",
            icon: "❄️"
        },

        80: {
            description: "Rain showers",
            icon: "🌦️"
        },

        81: {
            description: "Moderate rain showers",
            icon: "🌧️"
        },

        82: {
            description: "Heavy rain showers",
            icon: "⛈️"
        },

        95: {
            description: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            description: "Thunderstorm with hail",
            icon: "⛈️"
        },

        99: {
            description: "Heavy thunderstorm",
            icon: "⛈️"
        }
    };

    return weatherCodes[code] || {
        description: "Unknown weather",
        icon: "🌤️"
    };
}


// ============================================
// Get City Coordinates
// ============================================

async function getCityCoordinates(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search for the city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please enter a valid city.");
    }

    return data.results[0];
}


// ============================================
// Get Weather Data
// ============================================

async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to fetch weather information.");
    }

    return await response.json();
}


// ============================================
// Display Current Weather
// ============================================

function displayCurrentWeather(location, weather) {

    const current = weather.current;

    const weatherInfo =
        getWeatherInfo(current.weather_code);

    cityName.textContent = location.name;

    countryName.textContent =
        `${location.country} (${location.country_code})`;

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    weatherDescription.textContent =
        weatherInfo.description;

    // Use emoji as weather icon
    weatherIcon.src =
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="120"
                 height="120"
                 viewBox="0 0 120 120">
                <text x="60"
                      y="80"
                      text-anchor="middle"
                      font-size="70">
                    ${weatherInfo.icon}
                </text>
            </svg>
        `)}`;

    weatherIcon.alt = weatherInfo.description;

    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    pressure.textContent =
        `${Math.round(current.surface_pressure)} hPa`;
}


// ============================================
// Display 5-Day Forecast
// ============================================

function displayForecast(weather) {

    forecastContainer.innerHTML = "";

    const daily = weather.daily;

    for (let i = 0; i < 5; i++) {

        const date = new Date(daily.time[i]);

        const dayName =
            date.toLocaleDateString("en-US", {
                weekday: "short"
            });

        const weatherInfo =
            getWeatherInfo(daily.weather_code[i]);

        const maxTemp =
            Math.round(daily.temperature_2m_max[i]);

        const minTemp =
            Math.round(daily.temperature_2m_min[i]);

        const forecastCard =
            document.createElement("div");

        forecastCard.className = "forecast-card";

        forecastCard.innerHTML = `
            <h3>${dayName}</h3>

            <div style="font-size: 45px; margin: 10px;">
                ${weatherInfo.icon}
            </div>

            <div class="forecast-temp">
                ${maxTemp}°C / ${minTemp}°C
            </div>

            <p>
                ${weatherInfo.description}
            </p>
        `;

        forecastContainer.appendChild(forecastCard);
    }
}


// ============================================
// Search Weather
// ============================================

async function searchWeather() {

    const city = cityInput.value.trim();

    // Clear previous error
    errorMessage.textContent = "";

    // Validate input
    if (city === "") {

        errorMessage.textContent =
            "⚠️ Please enter a city name.";

        cityInput.focus();

        return;
    }

    // Show loading
    loading.style.display = "block";

    searchBtn.disabled = true;

    searchBtn.textContent = "Loading...";

    try {

        // Step 1: Find city
        const location =
            await getCityCoordinates(city);

        // Step 2: Get weather
        const weather =
            await getWeather(
                location.latitude,
                location.longitude
            );

        // Step 3: Display current weather
        displayCurrentWeather(
            location,
            weather
        );

        // Step 4: Display 5-day forecast
        displayForecast(weather);

    } catch (error) {

        console.error(error);

        errorMessage.textContent =
            `❌ ${error.message}`;

    } finally {

        // Hide loading
        loading.style.display = "none";

        searchBtn.disabled = false;

        searchBtn.textContent = "Search";
    }
}


// ============================================
// Search Button Event
// ============================================

searchBtn.addEventListener(
    "click",
    searchWeather
);


// ============================================
// Press Enter to Search
// ============================================

cityInput.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {
            searchWeather();
        }

    }
);


// ============================================
// Load Default City
// ============================================

cityInput.value = "Chennai";

searchWeather();
