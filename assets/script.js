const apiKey = "bf0e3db3a2c61074b0f149aa4b788f3a";
const apiUrl = "https://api.openweathermap.org/data/2.5/";
console.log('JavaScript is running');
function displayCurrent(cityData) {
  const { name, dt, main, wind } = cityData;
  const date = new Date(dt * 1000).toLocaleDateString("en-US");

  const cityNameEl = document.querySelector("#city-name");
  cityNameEl.textContent = name;

  const dateEl = document.querySelector("#date");
  dateEl.textContent = `(${date})`;

  const tempEl = document.querySelector("#temp");
  const tempF = Math.round(((main.temp - 273.15) * 9) / 5 + 32);
  tempEl.textContent = `Temperature: ${tempF} °F`;

  const windEl = document.querySelector("#wind");
  windEl.textContent = `Wind Speed: ${wind.speed} MPH`;

  const humidityEl = document.querySelector("#humidity");
  humidityEl.textContent = `Humidity: ${main.humidity}%`;

  const lat = cityData.coord.lat;
  const lon = cityData.coord.lon;
  uvIndex(lat, lon);
  forecast(cityData.id);
}

function currentWeather(city) {
  const queryUrl = `${apiUrl}weather?q=${city}&appid=${apiKey}`;
  fetch(queryUrl)
    .then((response) => response.json())
    .then((data) => {
      displayCurrent(data);
      addToList(data.name);
    })
    .catch((error) => console.error(error));
}

function uvIndex(lat, lon) {
  const queryUrl = `${apiUrl}uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  fetch(queryUrl)
    .then((response) => response.json())
    .then((data) => {
      const uvIndexEl = document.querySelector("#uv-index");
      uvIndexEl.textContent = `UV Index: ${data.value}`;
    })
    .catch((error) => console.error(error));
}

function forecast(cityid) {
  const queryUrl = `${apiUrl}forecast?id=${cityid}&appid=${apiKey}`;
  fetch(queryUrl)
    .then((response) => response.json())
    .then((data) => {
      const forecastEl = document.querySelector("#forecast");
      forecastEl.innerHTML = "";

      for (let i = 0; i < data.list.length; i += 8) {
        const { dt, main, weather } = data.list[i];
        const date = new Date(dt * 1000).toLocaleDateString("en-US");
        const temp = Math.round(((main.temp - 273.15) * 9) / 5 + 32);
        const icon = `https://openweathermap.org/img/w/${weather[0].icon}.png`;
        const description = weather[0].description;

        const forecastCard = `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${date}</h5>
              <p class="card-text">${description}</p>
              <img src="${icon}" alt="${description}">
              <p class="card-text">Temp: ${temp} °F</p>
              <p class="card-text">Humidity: ${main.humidity}%</p>
            </div>
          </div>
        `;

        forecastEl.insertAdjacentHTML("beforeend", forecastCard);
      }
    })
    .catch((error) => console.error(error));
}

function addToList(city) {
    // check if city already exists in list
    const existingItem = $(".list-group-item").filter(function () {
      return $(this).text() === city;
    });
  
    if (existingItem.length === 0) {
      // create new list item element
      const listItem = $("<li>").addClass("list-group-item").text(city);
      // add click event listener to the new item
      listItem.on("click", function () {
        currentWeather(city);
      });
      // add the new item to the list
      $(".list-group").append(listItem);
    }
  }
  
  
  function pastSearch(event) {
    const city = event.target.textContent;
    currentWeather(city);
  }
  
  function loadlastCity() {
    var lastCity = JSON.parse(localStorage.getItem("city")) || [];
  
    if (lastCity.length > 0) {
      var currentCity = lastCity[lastCity.length - 1];
      displayCurrent(currentCity);
    }
  
    var recentCitiesEl = document.querySelector("#recent-cities");
  
    // Clear recentCitiesEl first
    recentCitiesEl.innerHTML = "";
  
    for (var i = 0; i < lastCity.length; i++) {
      var city = lastCity[i];
  
      // Check if city already exists in recentCitiesEl
      var cityEl = document.querySelector(`[data-city="${city}"]`);
      if (!cityEl) {
        // Create new list item for the city
        var liEl = document.createElement("li");
        liEl.classList.add("list-group-item");
        liEl.textContent = city;
        liEl.setAttribute("data-city", city);
  
        // Add click event listener to load the city's weather data
        liEl.addEventListener("click", function () {
          displayCurrent(this.getAttribute("data-city"));
        });
  
        recentCitiesEl.prepend(liEl);
      }
    }
  }
  
  function removeHistory(event) {
    event.preventDefault();
    // clear the search history list
    $(".list-group").empty();
    // remove the search history data from local storage
    localStorage.removeItem("searchHistory");
  }
  
  $("#search-button").on("click", function (event) {
    event.preventDefault();
    const city = $("#city-input").val();
    currentWeather(city);
    // add the city to the search history list
    const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (!searchHistory.includes(city)) {
      searchHistory.push(city);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      addToList(city);
    }
  });
  
  $(document).on("click", ".list-group-item", pastSearch);
  $("#clear-history").on("click", removeHistory);
  $(document).ready(loadlastCity);
  