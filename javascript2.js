var map;
var markers = [];
function pageLoad() {
    showList(); // shows history
    var mapProp= {
        center:new google.maps.LatLng(60.45, 22.2833), // Turku
        zoom:5,
    };
    map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
    document.getElementById("search").onclick = search;
}

function search() {
    var marker, obj, node, node1, node2, node3, i, places, history, longitudeFirstPlace, latitudeFirstPlace, latitude, longitude;
    var client = new XMLHttpRequest();
    var countryHTML = document.getElementById("country");
    var country = countryHTML.value;
    var countryname = countryHTML.options[countryHTML.selectedIndex].text;
    var zipcode = document.getElementById("zipcode").value;
    var request = "https://api.zippopotam.us/" + country + "/" +zipcode;

    function setMarker(lat, lon) {
        var position = new google.maps.LatLng(lat, lon);
        marker = new google.maps.Marker({position: position});
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
    map.setZoom(5);
    places = document.getElementById("places");
    // removes all rows from table except header
    while (places.childNodes.length > 2) { // empty table has one child plus header is one child that is equal to two
        places.removeChild(places.lastChild);
    }
    history = document.getElementById("history");
    // removes all items from history list
    while (history.firstChild) {
        history.removeChild(history.firstChild);
    }
    if (zipcode.length !== 5) {
        alert("The zip code must have 5 digits");
        showList();
        removeMarkers();
        setCenter(60.45, 22.2833);
        return;
    }
    if (!(/^\d+$/.test(zipcode))) {
        alert("The zip code must have only digits");
        showList();
        removeMarkers();
        setCenter(60.45, 22.2833);
        return;
    }
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if(client.readyState === 4) {
            obj = JSON.parse(client.responseText); // Parses the data with JSON.parse(), and the data becomes a JavaScript object.
            if (!obj['places']) {
                alert("There are no places for the given zip code " + zipcode + " and the country " + countryname);
                showList();
                removeMarkers();
                setCenter(60.45, 22.2833);
                return;
            }
            removeMarkers();
            for (i=0; i<obj['places'].length; i++) { // appends rows with 3 cells to the table
                node = document.createElement("TR");
                node1 = document.createElement("TD");
                node1.innerHTML = obj['places'][i]['place name'];
                node2 = document.createElement("TD");
                node2.innerHTML = longitude = obj['places'][i]['longitude'];
                node3 = document.createElement("TD");
                node3.innerHTML = latitude = obj['places'][i]['latitude'];
                node.appendChild(node1);
                node.appendChild(node2);
                node.appendChild(node3);
                places.appendChild(node);
                setMarker(latitude, longitude);
            }
            longitudeFirstPlace = obj['places'][0]['longitude'];
            latitudeFirstPlace = obj['places'][0]['latitude'];
            setCenter(latitudeFirstPlace,  longitudeFirstPlace); // centers the map to the the first retrieved place
            saveList(countryname, zipcode);
            showList();
        }
    };
    client.send();
}
function showList() {
    //var list1 = [{"20500": "Finland"}, {"00100": "Finland"}, {"20100": "France"}];
    var node, textnode, item, list, i, key;
    if(typeof(Storage) !== "undefined") {
        if (localStorage.list) { // if list exists in the local storage
            list = JSON.parse(localStorage.getItem("list")); // retrieves the list (string) from the local storage and parses it into Javascript array
            for (i=0; i<list.length; i++) { // creates list items and appends them to the list
                node = document.createElement("LI");
                key = Object.keys(list[i])[0]; // each list element has only one key-value pair where key is zip code
                item = list[i][key]; // element value
                textnode = document.createTextNode(item + " - " + key);
                node.appendChild(textnode);
                document.getElementById("history").appendChild(node);
            }
        }
    } else {
        document.getElementById("history").innerHTML = "Sorry, your browser does not support web storage...";
    }
}
function saveList(country, zipcode) {
    //var list1 = [{"20500": "Finland"}, {"00100": "Finland"}, {"20100": "France"}];
    var list, element;
    if(typeof(Storage) !== "undefined") {
        if (localStorage.list) { // if history list already exists
            list = JSON.parse(localStorage.getItem("list")); // retrieves the list (string) from the local storage and parses it into Javascript array
            element = {};
            element[zipcode] = country; // creates new element of the list
            list.unshift(element); // adds new element to the beginning of the list
            if (list.length > 10) { // if list has more than 10 elements, removes the last element
                list.pop()
            }
            localStorage.setItem("list", JSON.stringify(list)); // converts Javascript array (list) into string and stores it into local storage
        } else { // if list does not exist
            element = {};
            element[zipcode] = country; // first element of the list
            //list.unshift(element);
            localStorage.setItem("list", JSON.stringify([element]));
        }
    } else {
        document.getElementById("history").innerHTML = "Sorry, your browser does not support web storage...";
    }
}

window.onload = pageLoad;


