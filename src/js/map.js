//Declare here for having globally access
//Living Planet HQ coordinates
var lat = 54.976702181361894;
var lng = -1.60709588914859;
var myLatLng = null
var marker = null;
var map = null;

    function initMap() {
    myLatLng = new google.maps.LatLng(lat, lng);

    let mapOptions = {
        center: myLatLng,
        zoom: 5.5,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        streetViewControl: true,
        overviewMapControl: false,
        rotateControl: false,
        scaleControl: false,
        panControl: false,
        mapId: "DEMO_MAP_ID",
    };

     map = new google.maps.Map(document.getElementById('map'), mapOptions);

     marker = new google.maps.Marker({
        map: map,
        position: myLatLng,
        title: "Living Planet HQ"
    });


    setCustomMarker("logoLP2", marker);
    $("#location").text(marker.title);

    /*  Add an event listener to show Air Quality details when user click on the marker */
    google.maps.event.addListener(marker, 'click', function (event){
        // Call the functions for update the weather info
        $("#location").text(marker.title);
        getCurrentWeather(lat, lng);
        getCurrentLocation(lat, lng);
    });

    //Call function for adding marker and update weather information basing on location selected
    clickMap();
    //Call function that open an info window with air information
    markerEvents(marker, lat, lng);

}
// Call the initMap function when the document is ready
$(document).ready(function () {
    initMap();
    getCurrentWeather(lat, lng);
    getCurrentLocation(lat, lng);

    // Use event delegation to handle clicks on dynamically added elements
    $(document).on('click', '#moreinfo', function(event){
        $('#directionsPanel').empty();
        $("#air-components").html(table);
    });

    $(document).on('submit', '#directions', function(event){
        // Handle directions submission form
        event.preventDefault();
        let mode = $('#mode').val();
        $('#distance-info').empty();
        $('#extra-info').empty();
        $('#air-components').empty();
        infowindow.close();
        getDirections(mode);
    });
    $(document).on('click', '#pollutant_co', function(event){
        $('#extra-info').empty();
        $('#extra-info').html("<p>Carbon Monoxide is a gas that prevents the uptake of oxygen by the blood. This can lead to " +
            "a significant reduction in the supply of oxygen to the heart, particularly in people suffering from heart disease.</p>");
    });
    $(document).on('click', '#pollutant_no2', function(event){
            $('#extra-info').empty();
            $('#extra-info').html("<p>At very high level, Nitrogen Dioxide irritates the airways of the lungs, increasing the symptoms of those suffering from lung diseases.</p>");
    });
    $(document).on('click', '#pollutant_o3', function(event){
        $('#extra-info').empty();
        $('#extra-info').html("<p>At very high level, Ozone irritates the airways of the lungs, increasing the symptoms of those suffering from lung diseases.</p>");
    });
    $(document).on('click', '#pollutant_so2', function(event){
        $('#extra-info').empty();
        $('#extra-info').html("<p>At very high level, Sulphur Dioxide irritates the airways of the lungs, increasing the symptoms of those suffering from lung diseases.</p>");
    });
    $(document).on('click', '#pollutant_pm2_5', function(event){
        $('#extra-info').empty();
        $('#extra-info').html("<p>Particles with a diameter of 2.5 microns or less. They can be carried deep into the lungs where they can cause inflammation and a worsening of heart and lung diseases</p>");
    });
    $(document).on('click', '#pollutant_pm10', function(event){
        $('#extra-info').empty();
        $('#extra-info').html("<p>Particles with a diameter of 10 micrometres or less. They can be carried deep into the lungs where they can cause inflammation and a worsening of heart and lung diseases</p>");
    });
});