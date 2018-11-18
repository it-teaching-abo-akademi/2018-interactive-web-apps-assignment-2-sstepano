$(document).ready(function () {
    $("#hide").click(function () {
        $("div.info").slideToggle("fast", function () {
            if ($("#hide").text() === "Hide") {
                $("#hide").text("Show");
            } else {
                $("#hide").text("Hide");
            }
        });
    })
});

function pageLoad() {
    document.getElementById("decode").onclick = decode;
    document.getElementById("barcode").onfocus = changeBackColor;
    document.getElementById("barcode").onblur = returnBackColor;
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
function decode() {
    var barcode, account, amount, amount0, cents, total, ref, ref0, date;
    barcode = document.getElementById("barcode").value;
    if (barcode.charAt(0) === "4") {
       ref0 = barcode.substring(28, 48);
       ref =  ref0.replace(/^0+/, '');
       ref = transformRef4(ref);
    } else if (barcode.charAt(0) === "5") {
       ref0 = barcode.substring(27, 48);
       ref0 =  ref0.replace(/^0+/, '');
       ref = "RF" + barcode.substring(25,27) + ref0;
        ref = transformRef5(ref);
    } else {
        alert("The virtual bar code is neither of version 4 nor version 5!");
    }
    account = barcode.substring(1, 17);
    amount0 = barcode.substring(17, 23);
    if (amount0 !== "000000") {
        amount = amount0.replace(/^0+/, '');
    } else {
        amount = "0";
    }
    account = account.substring(0, 2) + " " + account.substring(2, 6) + " " + account.substring(6, 10) + " " + account.substring(10, 14) + " " + account.substring(14, 16);
    cents = barcode.substring(23, 25);
    total = amount + "," + cents;
    date = barcode.substring(48, 54);
    if (date !== "000000") {
        date = barcode.substring(52, 54) + "."  + barcode.substring(50, 52) + "." + "20" + barcode.substring(48, 50) + ".";
    } else {
        date = "None";
    }
    document.getElementById("iban").innerHTML = account;
    document.getElementById("amount").innerHTML = total;
    document.getElementById("ref").innerHTML = ref;
    document.getElementById("date").innerHTML = date;
    JsBarcode("#myCanvas", barcode, {
        format:"CODE128",
        displayValue:true,
        fontSize:20
    })
}
function changeBackColor() {
    document.getElementById("barcode").style.backgroundColor = "lightgrey";
}
function returnBackColor() {
    document.getElementById("barcode").style.backgroundColor = "";
}
window.onload = pageLoad;