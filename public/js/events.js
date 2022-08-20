if (window.location.pathname == "/") {
    document.querySelector(".loading").hidden = false;
    navigator.geolocation.getCurrentPosition((position) => {
        document.cookie = `lat=${position.coords.latitude}`;
        document.cookie = `lon=${position.coords.longitude}`;
        window.location.href = "/weather";
    }, (error) => {
        window.location.href = "/weather/location-error";
    });
}
