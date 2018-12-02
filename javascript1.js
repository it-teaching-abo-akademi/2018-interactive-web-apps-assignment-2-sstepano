$(document).ready(function () {
    $("#hide").click(function () { // slide toggle effect is executed to hide/show the information section
        $("div.info").slideToggle("fast", function () { // A callback function to change text of the button is executed after the current effect is finished
            if ($("#hide").text() === "Hide") {
                $("#hide").text("Show");
            } else {
                $("#hide").text("Hide");
            }
        });
    });
});

function pageLoad() {
    document.getElementById("decode").onclick = decode; // a function attached to the decode button onclick event
    document.getElementById("barcode").onfocus = changeBackColor; // a function attached to the barcode input field on focus event
    document.getElementById("barcode").onblur = returnBackColor; // another function attached to the barcode input field on blur event
}
function isValidDate(dateStr) {
    var dateString;
    dateString = "20".concat(dateStr.substring(0,2)) +"-"+dateStr.substring(2,4)+"-"+dateStr.substring(4,6);
    var d = new Date(dateString);
    if(Number.isNaN(d.getTime())) return false; // Invalid date e.g. 32.06.2013
    return d.toISOString().slice(0,10) === dateString; // Invalid date e.g. 31.06.2013
}

function transformRef4(ref, version) {
    var i, newref, t;
    t = ref.length % 5;
    newref=ref.substring(0,t);
    for (i = t; i<ref.length; i++) {
        if ((i-t)%5 === 0) {
            newref += " ";
        }
        newref += ref.charAt(i);
    }
    return newref;
}
function transformRef5(ref) {
    var i, newref;
    newref="";
    for (i = 0; i<ref.length; i++) {
        if (i%4 === 0) {
            newref += " ";
        }
        newref += ref.charAt(i);
    }
    return newref;
}
function decode() { // decodes the virtual bar code after some checking
    var barcode, account, amount, amount0, cents, total, ref, ref0, date;
    barcode = document.getElementById("barcode").value;
    if (barcode.length !== 54) {
        alert("The virtual barcode must have 54 digits");
        return;
    }
    if (!(/^\d+$/.test(barcode))) {
        alert("The virtual bar code must have only digits");
        return;
    }
    date = barcode.substring(48, 54);
    if (date !== "000000") {
        if (!isValidDate(date)) {
            alert("The date in the format YYMMDD (last 6 digits) is not valid");
            return;
        } else {
            date = barcode.substring(52, 54) + "." + barcode.substring(50, 52) + "." + "20" + barcode.substring(48, 50) + ".";
        }
    } else {
        date = "None";
    }
    if (barcode.charAt(0) === "4") { // version 4
       ref0 = barcode.substring(28, 48);
       ref =  ref0.replace(/^0+/, ''); // removes all leading zeros
       ref = transformRef4(ref); // output to be displayed on the screen
    } else if (barcode.charAt(0) === "5") { // version 5
       ref0 = barcode.substring(27, 48);
       ref0 =  ref0.replace(/^0+/, '');
       ref = "RF" + barcode.substring(25,27) + ref0;
       ref = transformRef5(ref); // output to be displayed on the screen
    } else {
        alert("The virtual bar code is neither of version 4 nor version 5. The first digit must be either 4 or 5");
        return;
    }
    account = barcode.substring(1, 17);
    amount0 = barcode.substring(17, 23);
    if (amount0 !== "000000") {
        amount = amount0.replace(/^0+/, '');
    } else {
        amount = "0";
    }
    if (amount.length === 4) {
        amount = amount.substring(0, 1) + "," + amount.substring(1, 4);
    } else if (amount.length === 5) {
        amount = amount.substring(0, 2) + "," + amount.substring(2, 5);
    } else if (amount.length === 6) {
        amount = amount.substring(0, 3) + "," + amount.substring(3, 6);
    }
    account = account.substring(0, 2) + " " + account.substring(2, 6) + " " + account.substring(6, 10) + " " + account.substring(10, 14) + " " + account.substring(14, 16); // output to be displayed on the screen
    cents = barcode.substring(23, 25);
    total = amount + "." + cents;
    total = total + " EUR";
    document.getElementById("iban").innerHTML = account;
    document.getElementById("amount").innerHTML = total;
    document.getElementById("ref").innerHTML = ref;
    document.getElementById("date").innerHTML = date;
    JsBarcode("#myCanvas", barcode, {
        format:"CODE128",
        displayValue:true,
        fontSize:20
    }); // generates bar code from virtual bar code
}
function changeBackColor() {
    document.getElementById("barcode").style.backgroundColor = "lightgrey";
}
function returnBackColor() {
    document.getElementById("barcode").style.backgroundColor = "";
}
window.onload = pageLoad; // an event that occurs after page is loaded and calls pageLoad function