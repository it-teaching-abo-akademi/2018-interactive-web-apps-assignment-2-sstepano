var longitudeMiddlePlace = 22.283;
var latitudeMiddlePlace = 60.45;
var markers = [];
var route;
var map;
function pageLoad() {
    makeOptions();
    var mapProp= {
        center:new google.maps.LatLng(60.45, 22.283), // Turku center
        zoom:11,
    };
    map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
    document.getElementById("showr").onclick = findSingleTripOfRoute; // a function attached to the Show route button onclick event
    document.getElementById("showb").onclick = findLocationsOfBuses; // a function attached to the Show buses button onclick event
    document.getElementById("refresh").onclick = refresh; // a function attached to the refresh button onclick event
}
function makeOptions() {
    var routes, node, node1, i;
    var client = new XMLHttpRequest();
    var busline = document.getElementById("busline");
    var request = "https://data.foli.fi/gtfs/routes";
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) { // when response is ready
            routes = JSON.parse(client.responseText); // parses the data of a JSON derived from an array, and the data becomes a JavaScript array of all routes
            if (!routes) {
                alert("The service is not responding");
                return;
            }
            routes.sort(compare);
            for (i = 0; i < routes.length; i++) {
                node1 = document.createElement("option");
                node1.innerHTML = routes[i]["route_short_name"];
                node1.value = routes[i]["route_id"];
                busline.appendChild(node1); // appends a option inside input select field for every route
            }
        }
    };
    client.send(); // sends request to call the Föli API
}
function findSingleTripOfRoute() {
    var trips, i;
    var client = new XMLHttpRequest();
    var buslineHTML = document.getElementById("busline");
    var busline = buslineHTML.value; // route id
    var routeShortName = buslineHTML.options[buslineHTML.selectedIndex].text;
    var request = "https://data.foli.fi/gtfs/trips/route/" + busline;
    if(typeof(Storage) !== "undefined") {
        if (!(sessionStorage.busline && sessionStorage.busline === busline)) { // if the currently selected bus line is not consecutively selected line by one of 2 Show buttons
            sessionStorage.busline = busline; // new bus line
            sessionStorage.routeShortName = routeShortName; // new corresponding short name
            // removes all markers from the map
            for (i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
        }
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support web storage...";
    }
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) {
            trips = JSON.parse(client.responseText); // all trips for the selected route
            if (!trips) {
                alert("There are no trips for the route_id " + busline);
                return;
            }
            findShapeOfTrip(trips[0]["shape_id"]); // selects one trip (the first one) out of all available for the selected route
        }
    };
    client.send();
}
function findShapeOfTrip(shape_id) {
    var shape;
    var client = new XMLHttpRequest();
    var request = "https://data.foli.fi/gtfs/shapes/" + shape_id;
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) {
            shape = JSON.parse(client.responseText); // the shape of the first trip of the selected route
            if (!shape) {
                alert("There is no shape for the shape id " + shape_id);
                return;
            }
            shape.forEach(function(v){ v["lng"] = v["lon"]; delete v["lon"];}); // changes name of the coordinate lon into lng
            showRoute(shape);
        }
    };
    client.send();
}
function showRoute(shape) {
    if (typeof(route) !== "undefined") {route.setMap(null);} // removes the previous route from the map
    route = new google.maps.Polyline({
        path: shape,
        //geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    route.setMap(map);
    if (shape.length) {
        var middlePoint = Number.parseInt(shape.length / 2); // middle point in the array of places that constitute the route
        longitudeMiddlePlace = shape[middlePoint]['lng'];
        latitudeMiddlePlace = shape[middlePoint]['lat'];
        var position = {lat: latitudeMiddlePlace, lng: longitudeMiddlePlace};
        map.setCenter(position); // Show route button always centers the map to this middle point
    } else {
        alert("The route does not exist");
    }
}
function setMarker(lat, lon) {
    var position = new google.maps.LatLng(lat, lon);
    var marker = new google.maps.Marker({position: position});
    marker.setMap(map); // adds a marker to the map
    markers.push(marker);
}
function setCenter(lat, lon) {
    var position = new google.maps.LatLng(lat, lon);
    map.setCenter(position);
}
// removes all markers from the map
function removeMarkers() {
    for (i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}
function findLocationsOfBuses() {
    var vehicles, vehiclesValues, longitude, latitude;
    var client = new XMLHttpRequest();
    var buslineHTML = document.getElementById("busline");
    var busline = buslineHTML.value;
    var routeShortName = buslineHTML.options[buslineHTML.selectedIndex].text;
    var request = "https://data.foli.fi/siri/vm";
    if(typeof(Storage) !== "undefined") {
        if (!(sessionStorage.busline && sessionStorage.busline === busline)) { // if the currently selected bus line is not consecutively selected line by one of 2 Show buttons
            sessionStorage.busline = busline; // new bus line
            sessionStorage.routeShortName = routeShortName; // new corresponding short name
            latitudeMiddlePlace = 60.45;
            longitudeMiddlePlace = 22.2833;
            setCenter(60.45, 22.2833); // Show buses button when selecting new line always centers the map to Turku center
            if (typeof(route) !== "undefined") {route.setMap(null);} // removes the previous route from the map
        } else {
            setCenter(latitudeMiddlePlace, longitudeMiddlePlace); // if it is, then Show buses button centers the map to the previous determined middle point that is either Turku center or middle point in the array of places of the route
        }
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support web storage...";
    }
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) {
            buses = JSON.parse(client.responseText); // all vehicles
            if (!buses) {
                alert("The service is not responding");
                return;
            } else if (buses["status"] === "PENDING") {
                alert("Vehicle monitoring service is not started at the moment. It will start producing data in 5-30 seconds");
                return;
            } else if (buses["status"] === "NO_SIRI_DATA") {
                alert("There are problems with the backend system");
                return;
            }
            vehicles = buses["result"]["vehicles"];
            vehiclesValues=Object.values(vehicles); // removes keys from key-value pairs
            removeMarkers();
            var selectedBuses = []; // buses on the selected route
            for (i = 0; i < vehiclesValues.length; i++) {
                if (vehiclesValues[i].hasOwnProperty("publishedlinename") && vehiclesValues[i]["publishedlinename"]=== routeShortName ) { // if a vehicle is a bus and if it is on the selected route
                    selectedBuses.push(vehiclesValues[i]);
                    latitude = vehiclesValues[i]["latitude"];
                    longitude = vehiclesValues[i]["longitude"];
                    setMarker(latitude, longitude);
                }
            }
            if (!selectedBuses.length) {
                alert("There are no buses on the bus route " + routeShortName);
            }
        }
    };
    client.send();
}
function refresh() {
    var routes, vehicles, vehiclesValues, longitude, latitude;
    var client = new XMLHttpRequest();
    var buslineHTML;
    var busline;
    var routeShortName;
    var request = "https://data.foli.fi/siri/vm";
    if(typeof(Storage) !== "undefined") {
        if (sessionStorage.busline) { // if a bus line is already selected by one of 3 buttons
            busline = sessionStorage.busline; // old line
            routeShortName = sessionStorage.routeShortName;
            setCenter(latitudeMiddlePlace, longitudeMiddlePlace); // old middle place
        } else { // before any of 2 Show buttons are pressed first time and when refresh button is pressed first time in the current session
            buslineHTML = document.getElementById("busline");
            busline = buslineHTML.value; // new bus line
            routeShortName = buslineHTML.options[buslineHTML.selectedIndex].text;
            setCenter(60.45, 22.2833);
        }
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support web storage...";
    }
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) {
            buses = JSON.parse(client.responseText);
            if (!buses) {
                alert("The service is not responding");
                return;
            } else if (buses["status"] === "PENDING") {
                alert("Vehicle monitoring service is not started at the moment. It will start producing data in 5-30 seconds");
                return;
            } else if (buses["status"] === "NO_SIRI_DATA") {
                alert("There are problems with the backend system");
                return;
            }
            vehicles = buses["result"]["vehicles"];
            vehiclesValues=Object.values(vehicles);
            removeMarkers();
            var selectedBuses = [];
            for (i = 0; i < vehiclesValues.length; i++) {
                if (vehiclesValues[i].hasOwnProperty("publishedlinename") && vehiclesValues[i]["publishedlinename"]=== routeShortName ) {
                    selectedBuses.push(vehiclesValues[i]);
                    latitude = vehiclesValues[i]["latitude"];
                    longitude = vehiclesValues[i]["longitude"];
                    setMarker(latitude, longitude);
                }
            }
            if (!selectedBuses.length) {
                alert("There are no buses on the bus route " + routeShortName);
            }
        }
    };
    client.send();
}
function compare(a, b) {
    var nameA = a["route_short_name"].toUpperCase(); // ignore upper and lowercase
    var nameB = b["route_short_name"].toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }

    // names must be equal
    return 0;
}
window.onload = pageLoad;


