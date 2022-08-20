if (window.location.pathname == "/") {
    navigator.geolocation.getCurrentPosition((position) => {
        document.cookie = `lat=${position.coords.latitude}`;
        document.cookie = `lon=${position.coords.longitude}`;
        window.location.href = "/weather";
    });
}
