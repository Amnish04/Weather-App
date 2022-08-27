const readline = require("readline");
require("dotenv").config();
const express = require('express');
const fetch = require("node-fetch");
const exphbs = require("express-handlebars");
// const rl = readline.createInterface(process.stdin, process.stdout);
const app = express();
const cookieParser = require('cookie-parser');
const { time } = require("console");
// Import the custom module
const weather = require(__dirname + "/modules/weather.js");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use('/favicon.ico', express.static('/favicon.ico'));
app.use(cookieParser());
const PORT = process.env.PORT || 8080;

// Configure Handlebars View Engine
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

const Weather_Key = process.env.WEATHER_KEY;
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
    // If location is retrieved
    weather.renderWeatherDataForLocation(res, req.cookies.lat, req.cookies.lon);
});

app.post("/weather", async (req, res) => {
    try {
        const locationRes = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${req.body.city}&limit=1&appid=${Weather_Key}`);
        const locationInfo = await locationRes.json();
        if (locationInfo.length == 0) { // Check if the entered city was valid
            throw `No city found with name '${req.body.city}'`;
        }
        weather.renderWeatherDataForLocation(res, locationInfo[0].lat, locationInfo[0].lon, UNITS);
    }
    catch(error) {
        res.render("index", {
            layout: false,
            error: error
        });
    }
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
