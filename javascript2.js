/*var client = new XMLHttpRequest();
client.open("GET", "http://api.zippopotam.us/fr/65100", true);
client.onreadystatechange = function() {
    if(client.readyState == 4) {
        alert(client.responseText);
    };
};
client.send();*/

function pageLoad() {
    showList();
    //myMap();
    document.getElementById("search").onclick = search;
    //document.getElementById("barcode").onfocus = changeBackColor;
    //document.getElementById("barcode").onblur = returnBackColor;
}
function search() {
    var obj, node, node1, node2, node3, i, places, history, longitudeFirstPlace, latitudeFirstPlace, latitude, longitude;
    var client = new XMLHttpRequest();
    var country = document.getElementById("country").value;
    //var countryname = document.getElementById("country").option[country];
    var zipcode = document.getElementById("zipcode").value;
    var request = "http://api.zippopotam.us/" + country + "/" +zipcode;
    var [setMarker, setCenter] = (function () {
        var mapProp= {
            //center:new google.maps.LatLng(22.2833, 60.45),
            zoom:5,
        };
        var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
        return [function(lat, lon) {
            var position = new google.maps.LatLng(lat, lon);
            var marker = new google.maps.Marker({position: position});
            marker.setMap(map);
            //map.setCenter(position);
        },
        function(lat, lon) {
            var position = new google.maps.LatLng(lat, lon);
            map.setCenter(position);
        } ];
    })();
    places = document.getElementById("places");
    while (places.firstChild) {
        places.removeChild(places.firstChild);
    }
    history = document.getElementById("history");
    while (history.firstChild) {
        history.removeChild(history.firstChild);
    }
    //showList();
    if (zipcode.length !== 5) {
        alert("The zip code must have 5 digits");
        showList();
        myMap();
        return;
    }
    if (!(/^\d+$/.test(zipcode))) {
        alert("The zip code must have only digits");
        showList();
        myMap()
        return;
    }
    client.open("GET", request, true);
    client.onreadystatechange = function() {
        if(client.readyState === 4) {
            obj = JSON.parse(client.responseText);
            //alert(obj['places'][0]['place name']);
            if (!obj['places']) {
                alert("There are no places for the given zip code " + zipcode + " and the country " + country);
                showList();
                myMap();
                return;
            }
            node = document.createElement("TR");
            node1 = document.createElement("TH");
            node1.innerHTML = "Place name";
            node2 = document.createElement("TH");
            node2.innerHTML = "Longitude";
            node3 = document.createElement("TH");
            node3.innerHTML = "Latitude";
            node.appendChild(node1);
            node.appendChild(node2);
            node.appendChild(node3);
            places.appendChild(node);
            for (i=0; i<obj['places'].length; i++) {
                var a=obj['places'][0]['place name'];
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
            setCenter(latitudeFirstPlace,  longitudeFirstPlace);
            saveList(country, zipcode);
            showList();
        }
    };
    client.send();
    //alert(obj.places[0].longitude);
    //alert(obj.toString());
    /*for (i=0; i<obj.places.length; i++) {
        alert(obj.places[i].longitude);
    }*/
/*    node = document.createElement("TR");
    node1 = document.createElement("TD");
    node2 = document.createElement("TD");
    node3 = document.createElement("TD");
    node.appendChild(node1);
    node.appendChild(node2);
    node.appendChild(node3);
    document.getElementById("places").appendChild(node);*/
}
function showList() {
    //var list1 = [{"Finland": "30500"}, {"Germany": "20800"}, {"France": "10000"}];
    var node, textnode, item, list, i, key;
    if(typeof(Storage) !== "undefined") {
        if (localStorage.list) {
            list = JSON.parse(localStorage.getItem("list"));
            for (i=0; i<list.length; i++) {
                node = document.createElement("LI");
                key = Object.keys(list[i])[0];
                item = list[i][key];
                textnode = document.createTextNode(item + " - " + key);
                node.appendChild(textnode);
                document.getElementById("history").appendChild(node);
            }
        } /*else {
            localStorage.setItem("list", JSON.stringify(list1));
        }*/
    } else {
        document.getElementById("history").innerHTML = "Sorry, your browser does not support web storage...";
    }
}
function saveList(country, zipcode) {
    //var list1 = [{"Finland": "30500"}, {"Germany": "20800"}, {"France": "10000"}];
    var list, element;
    if(typeof(Storage) !== "undefined") {
        if (localStorage.list) {
            list = JSON.parse(localStorage.getItem("list"));
            element = {};
            element[zipcode] = country;
            list.unshift(element);
            if (list.length > 10) {
                list.pop()
            }
            localStorage.setItem("list", JSON.stringify(list));
        } else {
            element = {};
            element[zipcode] = country;
            //list.unshift(element);
            localStorage.setItem("list", JSON.stringify([element]));
        }
    } else {
        document.getElementById("history").innerHTML = "Sorry, your browser does not support web storage...";
    }
}

function myMap(lat, lon) {
    if (typeof lat === "undefined") lat = 60.45;
    if (typeof lon === "undefined") lon = 22.2833;
    var mapProp= {
        center:new google.maps.LatLng(lat, lon),
        zoom:15,
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


