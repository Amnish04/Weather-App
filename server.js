const readline = require("readline");
require("dotenv").config();
const express = require('express');
const fetch = require("node-fetch");
const exphbs = require("express-handlebars");
// const rl = readline.createInterface(process.stdin, process.stdout);
const app = express();
const cookieParser = require('cookie-parser');
const { time } = require("console");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use('/favicon.ico', express.static('/favicon.ico'));
app.use(cookieParser());
const PORT = process.env.PORT || 8080;

const Weather_Key = process.env.WEATHER_KEY;

app.set("view engine", ".hbs");
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main.hbs",
    layoutsDir: "layouts",
    partialsDir: "partials",
    helpers: {
        lower: function (options) {
            let lowerString = "";
            Array(options.fn(this)).forEach((char) => {
                lowerString += char.toLowerCase();
            });
            return lowerString;
        },
        capital: function(options) {
            let words = options.fn(this).split(" ");
            return words.map((word) => {
                return word[0].toUpperCase() + word.substr(1);
            }).join(" ");
        },
        date: function(options) {
            const timestamp = Number(options.fn(this)) * 1000;
            const date = new Date(timestamp);
            const monthNames = ["January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"];
            return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        },
        round: function(options) {
            return Math.round(Number(options.fn(this)));
        }
    }
}));

const UNITS = "metric";

/* Routes */

// This route will render an empty index page that will load up the location of client in cookies and redirect to '/weather' endpoint, 
// where server can access the location through cookies
app.get("/", (req, res) => {
    res.render("index", {
        layout: false
    });
});

// This route checks if the cookies are correctly loaded with client location and then 
// tries to render the index page with all the weather data for corresponding location
// Otherwise redirects back to '/' route to capture the client location again
app.get("/weather", async (req, res) => {
    if (!(req.cookies.lat && req.cookies.lon)) { // If user directly visits to this route
        res.redirect("/");
    }
    try {
        // Gather Data
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.cookies.lat}&lon=${req.cookies.lon}&appid=${Weather_Key}&units=${UNITS}`);
        const weatherData = await weatherResponse.json();
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${req.cookies.lat}&lon=${req.cookies.lon}&appid=${Weather_Key}&units=${UNITS}`);
        const forecastData = await forecastResponse.json();
        forecastData.list = forecastData.list.filter((elem, index) => {
            return index % 8 == 0 && index > 0;
        });
        console.log(JSON.stringify(forecastData));
        // Operate on data
        if (Math.round(weatherData.cod/100) == 4) {
            throw weatherData.message;
        }
        // Format Data for easier use
        if (weatherData.size) weatherData = weatherData[0];
        weatherData.weather = weatherData.weather[0];
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
        })
    };
});

app.post("/weather", (req, res) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.city}&appid=${Weather_Key}&units=${UNITS}`)
    .then(data => data.json())
    .then(json => {
        if (json.cod === '404') {
            throw "No City Found with name '" + req.body.city + "'";
        }
        // Format Data for easier use
        if (json.size > 1) json = json[0];
        json.weather = json.weather[0];
        // Render the page with formatted data
        res.render("index", {
            data: json,
            layout: false
        });
    })
    .catch((err) => {
        res.render("index", {
            error: err,
            layout: false
        })
    });
});

app.get("/weather/location-error", (req, res) => {
    res.render("index", {
        layout: false,
        error: "Your Device did not allow access to your current location!"
    });
});

app.listen(PORT, () => {
    console.log("Started listening on PORT " + PORT);
});
