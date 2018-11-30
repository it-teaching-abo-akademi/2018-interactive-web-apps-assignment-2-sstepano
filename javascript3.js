/*var client = new XMLHttpRequest();
client.open("GET", "https://data.foli.fi/gtfs/routes", true);
client.onreadystatechange = function() {
    if(client.readyState == 4) {
        alert(client.responseText);
    };
};
client.send();*/
var longitudeMiddlePlace = 22.283;
var latitudeMiddlePlace = 60.45;
var markers = [];
var route;
function pageLoad() {
    makeOptions();
    var mapProp= {
        center:new google.maps.LatLng(60.45, 22.283),
        zoom:12,
    };
    map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
    //myMap();
    document.getElementById("showr").onclick = findSingleTripOfRoute;
    document.getElementById("showb").onclick = findLocationsOfBuses;
    document.getElementById("refresh").onclick = refresh;
}
function makeOptions() {
    var routes, node, node1, node2, node3, i, places, history, longitudeFirstPlace, latitudeFirstPlace;
    var client = new XMLHttpRequest();
    var busline = document.getElementById("busline");
    var request = "https://data.foli.fi/gtfs/routes";
    /*node1 = document.createElement("option");
    node1.value = "busline1";
    node1.innerHTML = "BusLine1";
    busline.appendChild(node1);*/
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) {
            routes = JSON.parse(client.responseText);
            //alert(obj['places'][0]['place name']);
            if (!routes) {
                alert("The service is not responding");
                return;
            }
            for (i = 0; i < routes.length; i++) {
                node1 = document.createElement("option");
                node1.innerHTML = routes[i]["route_short_name"];
                node1.value = routes[i]["route_id"];
                busline.appendChild(node1);
            }
        }
    };
    client.send();
}
function findSingleTripOfRoute() {
    var trips, node, node1, node2, node3, i, places, history, longitudeFirstPlace, latitudeFirstPlace;
    var client = new XMLHttpRequest();
    var buslineHTML = document.getElementById("busline");
    var busline = buslineHTML.value;
    var routeShortName = buslineHTML.options[buslineHTML.selectedIndex].text;
    var request = "https://data.foli.fi/gtfs/trips/route/" + busline;
    if(typeof(Storage) !== "undefined") {
        if (!(sessionStorage.busline && sessionStorage.busline === busline)) {
            sessionStorage.busline = busline;
            sessionStorage.routeShortName = routeShortName;
            //if (typeof(route) !== "undefined") {route.setMap(null);}
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            /*map = new google.maps.Map(document.getElementById('googleMap'), {
                zoom: 12,
                center: {lat: 60.45, lng: 22.2833},
            });*/
        }
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support web storage...";
    }
    /*node1 = document.createElement("option");
    node1.value = "busline1";
    node1.innerHTML = "BusLine1";
    busline.appendChild(node1);*/
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) {
            trips = JSON.parse(client.responseText);
            //alert(obj['places'][0]['place name']);
            if (!trips) {
                alert("There are no trips for the route_id " + busline);
                return;
            }
            findShapeOfTrip(trips[0]["shape_id"]);
        }
    };
    client.send();
}
function findShapeOfTrip(shape_id) {
    var shape, node, node1, node2, node3, i, places, history, longitudeFirstPlace, latitudeFirstPlace;
    var client = new XMLHttpRequest();
    var request = "https://data.foli.fi/gtfs/shapes/" + shape_id;
    /*node1 = document.createElement("option");
    node1.value = "busline1";
    node1.innerHTML = "BusLine1";
    busline.appendChild(node1);*/
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) {
            shape = JSON.parse(client.responseText);
            //alert(obj['places'][0]['place name']);
            if (!shape) {
                alert("There is no shape for the shape id " + shape_id);
                return;
            }
            //shape.forEach(function(v){ delete v["traveled"]; v["lat"]=Number(v["lat"]); v["lon"]=Number(v["lon"]); });
            shape.forEach(function(v){ v["lng"] = v["lon"]; delete v["lon"];});
            showRoute(shape);
        }
    };
    client.send();
}
function showRoute(shape) {
    //var longitudeMiddlePlace, latitudeMiddlePlace;
    /*var map = new google.maps.Map(document.getElementById('googleMap'), {
        zoom: 12,
        center: {lat: 60.45, lng: 22.2833},
    });*/
    /*var flightPlanCoordinates = [
        {lat: 37.772, lng: -122.214},
        {lat: 21.291, lng: -157.821},
        {lat: -18.142, lng: 178.431},
        {lat: -27.467, lng: 153.027}
    ];*/
    if (typeof(route) !== "undefined") {route.setMap(null);}
    route = new google.maps.Polyline({
        path: shape,
        //geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    route.setMap(map);
    if (shape.length) {
        var middlePoint = Number.parseInt(shape.length / 2);
        longitudeMiddlePlace = shape[middlePoint]['lng'];
        latitudeMiddlePlace = shape[middlePoint]['lat'];
        var position = {lat: latitudeMiddlePlace, lng: longitudeMiddlePlace};
        map.setCenter(position);
        //alert("Shape " + shape.length);
        //alert("LEn " + vehiclesLength + " lat " + latitudeMiddlePlace);
    } else {
        alert("The route does not exist");
    }
}
function setMarker(lat, lon) {
    var position = new google.maps.LatLng(lat, lon);
    marker = new google.maps.Marker({position: position});
    marker.setMap(map);
    markers.push(marker);
    //map.setCenter(position);
}
function setCenter(lat, lon) {
    var position = new google.maps.LatLng(lat, lon);
    map.setCenter(position);
}
function findLocationsOfBuses() {
    var routes, vehicles, vehiclesValues, node, node1, node2, node3, i, places, history, longitude, latitude;
    var client = new XMLHttpRequest();
    var buslineHTML = document.getElementById("busline");
    var busline = buslineHTML.value;
    var routeShortName = buslineHTML.options[buslineHTML.selectedIndex].text;
    var request = "https://data.foli.fi/siri/vm";
    if(typeof(Storage) !== "undefined") {
        if (!(sessionStorage.busline && sessionStorage.busline === busline)) {
            //alert("new line");
            sessionStorage.busline = busline;
            sessionStorage.routeShortName = routeShortName;
            setCenter(60.45, 22.2833);
            if (typeof(route) !== "undefined") {route.setMap(null);}
            /*map = new google.maps.Map(document.getElementById('googleMap'), {
                zoom: 12,
                center: {lat: 60.45, lng: 22.2833},
            });*/
        } else {
            //alert("old line");
            setCenter(latitudeMiddlePlace, longitudeMiddlePlace);
        }
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support web storage...";
    }
    /*node1 = document.createElement("option");
    node1.value = "busline1";
    node1.innerHTML = "BusLine1";
    busline.appendChild(node1);*/
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) {
            buses = JSON.parse(client.responseText);
            //alert(obj['places'][0]['place name']);
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
            //var key="publishedlinename";
            /*vehiclesValues.forEach(function(v){
                for (var k in v) {
                    if (v.hasOwnProperty(k) && k !== key1 && k !== key2) {
                        delete v[k];
                    }
                }
                v["lat"]=v["latitude"];
                v["lng"]=v["longitude"];
                delete v["latitude"];
                delete v["longitude"]
            });*/
            //var vehiclesLength = 0;
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
            var selectedBuses = [];
            for (i = 0; i < vehiclesValues.length; i++) {
                if (vehiclesValues[i].hasOwnProperty("publishedlinename") && vehiclesValues[i]["publishedlinename"]=== routeShortName ) {
                    selectedBuses.push(vehiclesValues[i]);
                    latitude = vehiclesValues[i]["latitude"];
                    longitude = vehiclesValues[i]["longitude"];
                    setMarker(latitude, longitude);
                    //if (vehiclesLength === 1) alert("latitude "+ latitude+ " longitude "+longitude);
                }
            }
            if (selectedBuses.length) {
                /*var middlePoint = Number.parseInt(selectedBuses.length / 2);
                longitudeMiddlePlace = selectedBuses[middlePoint]['longitude'];
                latitudeMiddlePlace = selectedBuses[middlePoint]['latitude'];*/
                //setCenter(latitudeMiddlePlace, longitudeMiddlePlace);
                //alert("LEN " + selectedBuses.length);
                //alert("LEn " + vehiclesLength + " lat " + latitudeMiddlePlace);
            } else {
                alert("There are no buses on the bus route " + routeShortName);
            }
        }
    };
    client.send();
}
function refresh() {
    var routes, vehicles, vehiclesValues, node, node1, node2, node3, i, places, history, longitude, latitude;
    var client = new XMLHttpRequest();
    var buslineHTML;
    var busline;
    var routeShortName;
    var request = "https://data.foli.fi/siri/vm";
    if(typeof(Storage) !== "undefined") {
        if (sessionStorage.busline) {
            //alert("REF old line");
            busline = sessionStorage.busline;
            routeShortName = sessionStorage.routeShortName;
            setCenter(latitudeMiddlePlace, longitudeMiddlePlace);
            //if (typeof(route) !== "undefined") {route.setMap(null);}
            /*map = new google.maps.Map(document.getElementById('googleMap'), {
                zoom: 12,
                center: {lat: 60.45, lng: 22.2833},
            });*/
        } else {
            buslineHTML = document.getElementById("busline");
            busline = buslineHTML.value;
            routeShortName = buslineHTML.options[buslineHTML.selectedIndex].text;
            setCenter(60.45, 22.2833);
        }
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support web storage...";
    }
    /*node1 = document.createElement("option");
    node1.value = "busline1";
    node1.innerHTML = "BusLine1";
    busline.appendChild(node1);*/
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if (client.readyState === 4) {
            buses = JSON.parse(client.responseText);
            //alert(obj['places'][0]['place name']);
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
            //var key="publishedlinename";
            /*vehiclesValues.forEach(function(v){
                for (var k in v) {
                    if (v.hasOwnProperty(k) && k !== key1 && k !== key2) {
                        delete v[k];
                    }
                }
                v["lat"]=v["latitude"];
                v["lng"]=v["longitude"];
                delete v["latitude"];
                delete v["longitude"]
            });*/
            //var vehiclesLength = 0;
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
            var selectedBuses = [];
            for (i = 0; i < vehiclesValues.length; i++) {
                if (vehiclesValues[i].hasOwnProperty("publishedlinename") && vehiclesValues[i]["publishedlinename"]=== routeShortName ) {
                    selectedBuses.push(vehiclesValues[i]);
                    latitude = vehiclesValues[i]["latitude"];
                    longitude = vehiclesValues[i]["longitude"];
                    setMarker(latitude, longitude);
                    //if (vehiclesLength === 1) alert("latitude "+ latitude+ " longitude "+longitude);
                }
            }
            if (selectedBuses.length) {
                /*middlePoint = Number.parseInt(selectedBuses.length / 2);
                longitudeMiddlePlace = selectedBuses[middlePoint]['longitude'];
                latitudeMiddlePlace = selectedBuses[middlePoint]['latitude'];*/
                //setCenter(latitudeMiddlePlace, longitudeMiddlePlace);
                //alert("LEN " + selectedBuses.length);
                //alert("LEn " + vehiclesLength + " lat " + latitudeMiddlePlace);
            } else {
                alert("There are no buses on the bus route " + routeShortName);
            }
        }
    };
    client.send();
}
function myMap(lat, lon) {
    if (typeof lat === "undefined") lat = 60.45;
    if (typeof lon === "undefined") lon = 22.2833;
    var mapProp= {
        center:new google.maps.LatLng(lat, lon),
        zoom:13,
    };
    var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
    return map;
}
/*function setMarker(lat, lon) {
    var map = myMap();
    var marker = new google.maps.Marker({position: new google.maps.LatLng(lat, lon)});
    marker.setMap(map);
}*/
window.onload = pageLoad;


