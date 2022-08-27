const fetch = require("node-fetch");
require("dotenv").config();
const Weather_Key = process.env.WEATHER_KEY;

/* Utility Functions */

// NOTE: This is not the best practice since the function is responsible for more than one thing, 
// but still using it to keep things simple
module.exports.renderWeatherDataForLocation = async function (res, lat, lon, units='metric') {
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${Weather_Key}&units=${units}`);
        const weatherData = await weatherResponse.json();
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${Weather_Key}&units=${units}`);
        const forecastData = await forecastResponse.json();
        // Forecast at the gap of 24 hours each
        forecastData.list = forecastData.list.filter((elem, index) => {
            return index % 8 == 0 && index > 0;
        });
        // If the Weather code is in 400 range
        if (Math.round(weatherData.cod/100) == 4) {
            throw weatherData.message;
        }
        // Format Data for easier use
        if (weatherData.size) weatherData = weatherData[0];
        weatherData.weather = weatherData.weather[0];
        weatherData.sys.country = new Intl.DisplayNames(
            ['en'], {type: 'region'}
          ).of(weatherData.sys.country);
        // Render the page with formatted data
        res.render("index", {
            data: {
                data: weatherData,
                forecastData: forecastData
            },
            layout: false
        });
    }
    catch(error) {
        res.render("index", {
            error: error,
            layout: false
        });
    };
}