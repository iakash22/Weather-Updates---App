const userTab = document.getElementById("user-weather");
const searchTab = document.getElementById("search-weather");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.getElementById("data-search");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.getElementById("grant-btn");
const errorConatiner = document.getElementById("error-container");
const errorMsg = document.getElementById("apiErrorMsg");
const retryBtn = document.getElementById("retryBtn");


let oldTab = userTab;
let API_KEY = "a1e5574427743b612eb1f58787418a18";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            errorConatiner.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            errorConatiner.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});


function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    grantAccessContainer.classList.remove("active");
    errorConatiner.classList.remove("active");
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const  data = await response.json();
        if(!data.sys){
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(error) {
        loadingScreen.classList.remove("active");
        errorConatiner.classList.add("active");
        errorMsg.innerText = `Error : ${error?.message}`
        retryBtn.addEventListener('click', () => {
            errorConatiner.classList.remove("active");
            grantAccessContainer.classList.add("active");
        });
    }
}

function showError(error) {
    switch (error.code) {
    case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
    case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
    break;
    case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
    case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
}
function renderWeatherInfo(data){
    
    const cityName = document.getElementById("city-name")
    const countryIcon = document.getElementById("country-img");
    const weatherdesc = document.getElementById("weather-desc");
    const weatherIcon = document.getElementById("weather-icon");
    const temprature = document.getElementById("data-temp");
    const windSpeed = document.getElementById("windspeed");
    const humidity = document.getElementById("humidity");
    const cloudiness = document.getElementById("cloudiness");
    
    
    cityName.innerText = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    weatherdesc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temprature.innerText = `${data?.main?.temp} °C`;
    windSpeed.innerText = `${data?.wind?.speed}m/s`;
    humidity.innerText = `${data?.main?.humidity}%`;
    cloudiness.innerText = `${data?.clouds?.all}%`;
}

const grantErrorMsg = document.getElementById("error-msg");

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else {
        grantAccessButton.style.display = "none";
        grantErrorMsg.innerText = "Geolocation is not supported by this browser";
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.getElementById("search-input");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
        searchInput.value = "";
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorConatiner.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        if(!data.sys){
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        errorConatiner.classList.add("active");
        errorMsg.innerText = err.message;
        retryBtn.addEventListener('click',() => {
            errorConatiner.classList.remove("active");
        })
    }
}


