// Global variable to store the current marker for the location clicked by user
var currentMarker = null;
const OWAPIKEY = '6402918b874a7eeeaf45d1b70a41349c';
const GOOGLEAPIKEY = 'AIzaSyCHX9mxzGnV0GeIWL7d4Er_dsLupYDMQp0';

var infoWindowContent = '';
var table = '';
//Globally save the quality air checked for the location selected
var color = '';
//Flag for checking if the mouse is over the Living Planet Marker
var isMouseOverMarker = false;
var infowindow = null;
let displayDirections = null;

//retrieve current weather data from the OpenWeatherMap API based on latitude and longitude coordinates.
// $.getJSON() method to make an AJAX request to the API endpoint
function getCurrentWeather(latitude, longitude){
    $.getJSON('http://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&units=metric&appid='+ OWAPIKEY, displayCurrentWeather);
}

function getCurrentLocation(latidute, longitude) {
    $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng='+ latidute + ',' + longitude + '&key=' + GOOGLEAPIKEY, displayCurrentLocation);
}

function displayCurrentLocation(data) {
    //Check status of the request and that result array is not empty. Only if it is access to data and display it
    if(data.status === 'OK' && data.results && data.results.length >= 5) {
            let location = data.results[4].formatted_address;
            $("#location").text($("#location").text() + "\n" + location);
    } else {
        // Handle error
        $("#location").text("Unknown Location");
    }
}
function displayCurrentWeather(data){
    //store icon id
    var iconID = data.weather[0].icon;
    // concatenate the icon id to http://openweathermap.org/img/w/ to have the correct path where the API stores the icons
    var url = "http://openweathermap.org/img/w/" + iconID + ".png";
    // update the src attribute in <img>
    $("#weather-icon").attr('src', url);
    // Display temperature in Celsius
    $("#temp").text(Math.floor(data.main.temp_max) + "/" + Math.floor(data.main.temp_min));
    $("#desc").text(data.weather[0].description);
    $("#wind").text(data.wind.speed + " m/s");
    $("#humidity").text(data.main.humidity + " %");
}

function addMarker(latitude, longitude) {
    //remove any previous info
    let myLatLng = new google.maps.LatLng(latitude, longitude);

    // Remove the prior marker if it exists
    if (currentMarker) {
        currentMarker.setMap(null); // Remove the marker from the map
    }
   currentMarker = new google.maps.Marker({
        map: map,
        position: myLatLng,
    });

    markerEvents(currentMarker, latitude, longitude);

}

function clickMap() {
    /*  Add an event listener to update the location selected by the user */
    google.maps.event.addListener(map, 'click', function(event) {
        // Get coordinates of the clicked point
        var clickedLat = event.latLng.lat();
        var clickedLng = event.latLng.lng();
        // Call the functions for update the weather info
        getCurrentWeather(clickedLat, clickedLng);
        //ensures that any previous distance information is cleared before displaying the new information
        infowindow.close();
        $('#location').empty();
        $('#extra-info').empty();
        $("#distance-info").empty();
        $('#air-components').empty();
        getCurrentLocation(clickedLat, clickedLng);
        addMarker(clickedLat,clickedLng);

        //if a route has already been calculated and shown on the map, call clearMap to clean and set again displayDirections as null
        if(displayDirections != null ) {
            clearMap();
            displayDirections = null;
        }
    });
}

function getAirPollution(latitude, longitude) {
    $.getJSON('http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=' +latitude+ '&lon=' + longitude + '&appid=' + OWAPIKEY ,checkAirQuality);
}
function displayAirPollution(data) {
    if (color === "green") {
        infoWindowContent = "<div id='window-content' class='green'><h2>Low Air Pollution. </h2><div class='info_body'><p>Enjoy your usual outdoor activities.</p>";
    }else if (color === "yellow")
        infoWindowContent = "<div id='window-content' class='yellow'><h2>Moderate Air Pollution.</h2><div class='info_body'><p>Enjoy your usual outdoor activities." +
            " Adults and children with lung problems, and adults with heart problems, who " +
            "experience symptoms, should consider reducing strenuous physical activity, particularly " +
            "outdoors. </p>";
    else if (color === "red")
        infoWindowContent = "<div id='window-content' class='red'><h2>High Air Pollution.</h2><div class='info_body'><p> Adults and children with lung problems, and adults with heart problems, " +
            "should reduce strenuous physical exertion, particularly outdoors, and particularly if they" +
            " experience symptoms. People with asthma may find they need to use their reliever inhaler more often." +
            " Older people should also reduce physical exertion. Anyone experiencing discomfort such as sore eyes, " +
            "cough or sore throat should consider reducing activity, particularly outdoors </p>";
    else if (color === "vred")
        infoWindowContent = "<div id='window-content' class='vred'><h2>Very High Air Pollution.</h2><div class='info_body'><p> Adults and children with lung problems, adults with heart problems, " +
            "and older people, should avoid strenuous physical activity. People with asthma may find they need to use their reliever inhaler more often." +
            "Reduce physical exertion</p>";

    infoWindowContent += "<button id='moreinfo'>More Info</button></div></div>";

    table = "<table><tr><th>Pollutant</th><th>Concentration</th></tr>";
    //Pollution components for the selected location
    var components = data.list[0].components;
    //Iterate over the properties of the components object
    $.each(components, function(component, value) {
        table += "<tr><td id='pollutant_" + component + "'>" + component + "</td><td>" + value + "</td></tr>";
    });
    table += "</table>";
}
function checkAirQuality(data) {
    //  To establish the Air Pollution Level UK index is also being considered
    //  aqi = 1 or aqi = 2 low pollution
    //  aqi = 3 Moderate pollution
    //  aqi = 4 and O3 <161 - Moderate pollution otherwise - High Pollution
    //  aqi = 5 - High Pollution
    //  aqi = 5 and one of the components exceed the value included in High Pollution range - Very High Pollution
    if (data.list[0].main.aqi === 1 || data.list[0].main.aqi === 2)
        color = "green";
    else if (data.list[0].main.aqi === 3)
        color = "yellow"
    else if (data.list[0].main.aqi === 4) {
        if (data.list[0].components.o3 < 161)
            color = "yellow";
        else
            color = "red"
    } else if (data.list[0].main.aqi === 5) {
        if (data.list[0].components.so2 > 1065 || data.list[0].components.o3 > 241 || data.list[0].components.no2 > 601
            || data.list[0].components.pm2_5 > 71 || data.list[0].components.pm10 > 101) {
            color = "vred";
        } else
            color = "red";
    }
    //if the mouse is not over the Living Planet HQ marker, customise the marker for current location
    if(isMouseOverMarker === false)
    setCustomMarker(color, currentMarker);
    displayAirPollution(data);
}

function setCustomMarker(img, mark) {
    let url = "assets/img/markers/" + img + ".png";
    let customIcon = {
        url: url,
        scaledSize: new google.maps.Size(80, 80), // Adjust the size of the icon if needed
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 40) // Adjust the anchor point if needed
    }
    mark.setIcon(customIcon);
}

function markerEvents(mark, latitude, longitude) {
    infowindow = new google.maps.InfoWindow();

        google.maps.event.addListener(mark, 'click', function (){

            // if the infowindow opened is not for Living Planet HQ, add a button for get directions
            if(mark === marker)
                infowindow.setContent(infoWindowContent);
            else
                infowindow.setContent(infoWindowContent + "<div class='travel_mode'>" +
                    " <form id='directions' action='' method='get'> " +
                    "<label for='mode'>Select Travel Mode: </label>" +
                        " <select id='mode'>\n" +
                        "            <option value='DRIVING'>Driving</option>" +
                        "            <option value='WALKING'>Walking</option>" +
                        "            <option value='BICYCLING'>Bicycling</option>" +
                        "            <option value='TRANSIT'>Transit</option>" +
                        " </select>\n" +
                    "<input type='submit' value='Get Directions to Living Planet HQ'>" +
                    "</form></div>");

                infowindow.open({
                    anchor: mark,
                    map,
                });

            // Listen for the closeclick event
            google.maps.event.addListener(infowindow, 'closeclick', function() {
                $('#air-components').empty();
                $('#extra-info').empty();
            });
            //if a route has already been calculated and shown on the map, call clearMap to clean and set again displayDirections as null
            if(displayDirections != null ) {
                clearMap();
                displayDirections = null;
            }
        });
    /*  Add an event listener to show Air Quality details when user click on the marker */
    google.maps.event.addListener(mark, 'mouseover', function (event){
        if(mark===marker)
            isMouseOverMarker = true
        else
            isMouseOverMarker = false
        getAirPollution(latitude, longitude);
    });
}

//get directions from Location selected to Living Planet HQ
function getDirections(travelMode){

    //create a new instance of the DirectionsService
    let service = new google.maps.DirectionsService();
    //create a variable to display the directions
    displayDirections = new google.maps.DirectionsRenderer();
    //get position of both Living Planet HQ and current location selected
    let origin = currentMarker.getPosition();
    let destination = marker.getPosition();

    let request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode[travelMode]
    };

    service.route(request, function(response, status) {
        // If the status of the request is Ok, set directions, display them on the map, and call the function to get distance info otherwise handle errors
        if (status == google.maps.DirectionsStatus.OK) {

            displayDirections.setDirections(response);
            displayDirections.setMap(map);
            getDistance(origin, destination, travelMode);

        } else if (status == google.maps.DirectionsStatus.ZERO_RESULTS) {
            //if no route could be found
            $("#distance-info").prepend("<p>No route could be found with the origin selected.</p>")
        } else if(status == google.maps.DirectionsStatus.REQUEST_DENIED || status == google.maps.DirectionsStatus.INVALID_REQUEST) {
            //if the request was declined or invalid
            $("#distance-info").prepend("<p>Invalid Request.</p>")
        } else if(status == google.maps.DirectionsStatus.NOT_FOUND){
            //if the route between origin and destination could not be found
            $("#distance-info").prepend("<p>No route found between the specified locations." +
                " Please check the location you want to depart from and try again.</p>");
        }else if(status == google.maps.DirectionsStatus.UNKNOWN_ERROR) {
            //if an unknown error occurred
            $("#distance-info").prepend("<p>An unknown error occurred. Please try again.</p>");
        }
    });
}

// This function calculate the distance between the location selected by user and Living Planet HQ
function getDistance(origin, destination, travelMode) {
    // new instance of the DistanceMatrixService
    let service = new google.maps.DistanceMatrixService();

    ////calls the getDistanceMatrix method of the DistanceMatrixService and pass an object containing parameters needed for calculate the distance
    service.getDistanceMatrix(
        {
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode[travelMode],
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false
            //callback function will be executed when the service responds with the distance information
        }, callback);
}
function callback(response, status) {

    //If DistanceMatrixStatus responds successfully (OK), extract and display the distance and duration information.
    if (status == google.maps.DistanceMatrixStatus.OK) {
        let origins = response.originAddresses;
        let destinations = response.destinationAddresses;

            let results = response.rows[0].elements;
                let element = results[0];
                let distance = element.distance.text;
                let duration = element.duration.text;
                let from = origins[0];
                let to = destinations[0];
                // create a div element using jQuery to display the journey information
                let contentString ="<dl id='distance-dl'><dt>Distance: </dt><dd>" + distance +
                    "</dd> <dt>Duration: </dt><dd>" + duration + "</dd> <dt>From: </dt><dd>" + from +
                   "</dd> <dt>To: </dt><dd>" + to + "</dd> </dl>" +
                    "<button id='panel'>Route</button>";
        // Set the content and position of the InfoWindow
        infowindow.setContent(contentString);
        infowindow.open(map);

        $('#panel').click(function (event){
            //now set the directionsDisplay Panel to be a div element
            displayDirections.setPanel(document.getElementById("directionsPanel"));
        });
                //Handle possible errors if status is not OK
    }else if (status == google.maps.DistanceMatrixStatus.MAX_DIMENSIONS_EXCEEDED) {
        $("#distance-info").prepend("<p> You exceeded waypoints or locations that this service can allow</p>");
    }else if(status == google.maps.DistanceMatrixStatus.UNKNOWN_ERROR) {
        $("#distance-info").prepend("<p>An unknown error occurred. Please try again.</p>");
    }

}

//This function cleans the map from previous directions (and markers)
function clearMap() {
    displayDirections.setDirections({ routes: [] });
    displayDirections = null;
}
