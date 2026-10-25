
const latitude = 51.0447;
const longitude = -114.0719;

const temperatureText = document.querySelector("#temperature");
const outfitNote = document.querySelector("#outfit-note");
const conditionText = document.querySelector("#condition");
const updatedText = document.querySelector("#updated");
const errorMessage = document.querySelector("#error-message");
const refreshButton = document.querySelector("#refresh-button");
const weatherScene = document.querySelector("#weather-scene");
const weatherPicture = document.querySelector("#weather-picture");
const sceneCaption = document.querySelector("#scene-caption");

function getWeatherDetails(code, windSpeed) {
  if (windSpeed >= 35) {
    return { text: "Windy", scene: "cloudy" };
  }

  if (code === 0) {
    return { text: "Clear and sunny", scene: "sunny" };
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { text: "Rainy", scene: "cloudy" };
  }

  if (code >= 95) {
    return { text: "Stormy", scene: "cloudy" };
  }

  if (code === 1 || code === 2 || code === 3 || code === 45 || code === 48) {
    return { text: "Cloudy", scene: "cloudy" };
  }

  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { text: "Snowy", scene: "snowy" };
  }

  return { text: "Cloudy", scene: "cloudy" };
}

async function getWeather() {

  refreshButton.disabled = true;
  errorMessage.hidden = true;
  errorMessage.textContent = "";
  updatedText.textContent = "Getting the latest weather";
  conditionText.textContent = "Loading...";
  sceneCaption.textContent = "Looking outside...";

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh&timezone=America%2FEdmonton`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("The weather service did not respond.");
    }

    const data = await response.json();
    const currentWeather = data.current;

    if (!currentWeather) {
      throw new Error("The weather information was missing.");
    }

    const temperature = currentWeather.temperature_2m;
    const details = getWeatherDetails(currentWeather.weather_code, currentWeather.wind_speed_10m);
    let layerAdvice = "Looks like light-layer weather.";

    if (temperature <= 0) {
      layerAdvice = "Bundle up before heading out.";
    } else if (temperature < 12) {
      layerAdvice = "A jacket is a good idea.";
    } else if (temperature >= 22) {
      layerAdvice = "You probably won't need a jacket.";
    }

    temperatureText.innerHTML = `${temperature.toFixed(1)}<span>°C</span>`;
    outfitNote.textContent = layerAdvice;
    conditionText.textContent = details.text;
    updatedText.textContent = `Updated ${new Date().toLocaleTimeString("en-CA", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
    let picture = "images/cloudy.svg";

    if (details.scene === "sunny") {
      picture = "images/sunny.svg";
    } else if (details.scene === "snowy") {
      picture = "images/snowy.svg";
    }

    weatherPicture.src = picture;
    weatherPicture.alt = `${details.text} weather in Calgary, seen through a window`;
    sceneCaption.textContent = `Outside in Calgary: ${details.text.toLowerCase()}`;
    weatherScene.setAttribute("aria-label", `A window looking out at a ${details.text.toLowerCase()} Calgary sky`);
  } catch (error) {
  
    errorMessage.textContent = "I couldn't load the weather right now. Check your internet and try again.";
    errorMessage.hidden = false;
    conditionText.textContent = "Weather unavailable";
    outfitNote.textContent = "Try again in a little while.";
    updatedText.textContent = "Please try again";
    sceneCaption.textContent = "Weather data could not load";
    console.error(error);
  } finally {
    refreshButton.disabled = false;
  }
}

// This button calls the API again without reloading the whole webpage.
refreshButton.addEventListener("click", getWeather);


getWeather();
