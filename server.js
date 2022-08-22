const readline = require("readline");
require("dotenv").config();
const express = require('express');
const fetch = require("node-fetch");
const exphbs = require("express-handlebars");
// const rl = readline.createInterface(process.stdin, process.stdout);
const app = express();
const cookieParser = require('cookie-parser')

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use('/favicon.ico', express.static('/favicon.ico'));
app.use(cookieParser());
const PORT = process.env.PORT || 8080;

const Weather_Key = process.env.WEATHER_KEY || "95c53b7e4a348c53da6093ce4c53cbd8";
console.log(Weather_Key);

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
        }
    }
}));

const units = "metric";


/* Routes */
app.get("/", (req, res) => {
    res.render("index", {
        layout: false
    });
});

app.get("/weather", (req, res) => {
    if (!(req.cookies.lat && req.cookies.lon)) { // If user directly visits to this route
        res.redirect("/");
    }
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.cookies.lat}&lon=${req.cookies.lon}&appid=${Weather_Key}&units=${units}`)
    .then(data => data.json())
    .then((json) => {
        if (Math.round(json.cod/100) == 4) {
            throw json.message;
        }
        // Format Data for easier use
        if (json.size) json = json[0];
        json.weather = json.weather[0];
        // Render the page with formatted data
        res.render("index", {
            data: json,
            layout: false
        });
    })
    .catch((error) => {
        res.render("index", {
            error: error,
            layout: false
        })
    });
});

app.post("/weather", (req, res) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.city}&appid=${Weather_Key}&units=${units}`)
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
