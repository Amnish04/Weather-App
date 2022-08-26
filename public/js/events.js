if (window.location.pathname == "/") {
    document.querySelector(".loading").hidden = false;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
        document.cookie = `lat=${position.coords.latitude}`;
        document.cookie = `lon=${position.coords.longitude}`;
        window.location.href = "/weather";
        }, (error) => { // If unable to access client location
            console.log(error);
            window.location.href = "/weather/location-error";
        }, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000
        });
    } else {
        console.log("No Geolocation object!");
    }
}
