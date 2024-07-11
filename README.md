# Weather-App
A basic weather web application that uses its own REST API to make requests to OpenWeatherMap API. The requests are kept on back-end to keep the API key a secret since it is exposed to the client/user when using on front-end. Technologies/Frameworks used are Node.js, Express.js, Handlebars.js, HTML5, CSS3 and Client-Side JS

### Important Note: 

Always use the application with **https** so it can access your current location to find weather details for you! This feature is not available for http protocol since it is unsafe and does not have permission to access sensitive user data such as user's live location.

## Key Feaures
* Fetches data for your current location by using cookies
* Helps autocomplete city names using the API 'GeoDB Cities' --> https://rapidapi.com/wirefreethought/api/geodb-cities/
* Searches current and forecast weather for the location entered by the user
