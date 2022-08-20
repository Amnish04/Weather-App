const readline = require("readline");
require("dotenv").config();
const express = require('express');
const fetch = require("node-fetch");
const exphbs = require("express-handlebars");
// const rl = readline.createInterface(process.stdin, process.stdout);
const app = express();
const { Navigator } = require("node-navigator");
const navigator = new Navigator();

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
const PORT = process.env.PORT | 3000;

const Weather_Key = "95c53b7e4a348c53da6093ce4c53cbd8";

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

app.get("/", (req, res) => {
    res.render("index", {
        layout:false
    });
});

app.get("/weather", (req, res) => {
    navigator.geolocation.getCurrentPosition((position, error) => {
        if (!error) {
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${position.latitude}&lon=${position.longitude}&appid=${process.env.WEATHER_KEY}&units=metric`)
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
        } else {
            res.render("index", {
                layout: false
            })
        }
        
    });
});

app.post("/weather", (req, res) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.city}&appid=${process.env.WEATHER_KEY}&units=metric`)
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

app.listen(PORT, () => {
    console.log("Started listening on PORT " + PORT);
});
