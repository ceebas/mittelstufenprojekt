/* FileUpload */
var files;
// Anzeige von Dateiinformationen der ausgewählten Datei(en)
function handleFileSelect(evt) {
    files = evt.target.files;
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ', f.size, ' bytes </li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function uploadFile() {
    var file = document.getElementById("files").files[0];
    var formData = new FormData();
    client = new XMLHttpRequest();
    var gamedata = {
        gamename: document.getElementById("gamename").value,
        gamedescription: document.getElementById("gamedescription").value,
    }
    if (!file) {
        return;
    }
    //Fügt dem formData Objekt unser File Objekt hinzu
    for (var i = 0, f; f = files[i]; i++) {
        formData.append("datei", files[i]);
    }
    client.onerror = function(e) {
        alert("Es ist ein Fehler aufgetreten!");
    }
    client.onabort = function(e) {
        alert("Upload abgebrochen");
    }
    formData.append("gamename", gamedata.gamename);
    formData.append("gamedescription", gamedata.gamedescription);
    client.open("POST", "/uploads");
    client.send(formData);

    client.onreadystatechange = function() {
        if (client.readyState == 4 && client.status == 200) {
            window.location = client.response;
        }
    }
}

// Textarea-Limit-Anzeige für Spielbeschreibung
function textareaLimiter() {
    var length = $('textarea#gamedescription').val().length;
    var maxlength = $('textarea#gamedescription').attr('maxlength');
    $('#descletters').text(maxlength-length);
}

// Textlimit-Anzeige für Spieltitel
function inputLimiter() {
    var length = $('input#gamename').val().length;
    var maxlength = $('input#gamename').attr('maxlength');
    $('#titleletters').text(maxlength-length);
}

// Gibt es ein Canvas, wird scrolling deaktiviert
$(document).keydown(function(e) {
    if(e.keyCode == 32) {
        if($('#canvas').length) {
            return false;
        }
    }
});

/* Angabe des aktuellen wertes bei Schiebereglern (CreateGame)*/
function showValue(newValue, id)
{
    var elementID = id + "_span";
    //document.getElementById(elementID).innerHTML=' '+newValue;
    $('span#'+elementID).text(" " +newValue);

}

function showDiv(id){
    if (id == "shoot") {
        if ($('input#player_shoot_enable').prop('checked')) {
            $('div#shoot_enabled').removeClass("hidden");
        } else {
            $('div#shoot_enabled').addClass("hidden");
        }

    } else if (id == "foes") {
        if ($('input#foes_active').prop('checked')) {
            $('div#foes_enabled').removeClass("hidden");
        } else {
            $('div#foes_enabled').addClass("hidden");
        }

    } else if (id == "selfscroll") {
        if ($('input#selfscroll').prop('checked')) {
            $('div#scroll').removeClass("hidden");
        } else {
            $('div#scroll').addClass("hidden");
        }

    } else if (id  == "player_shape" || id == "foes_shape") {
        var kind;
        if (id == "player_shape") {
            kind = "player";
        } else if (id == "foes_shape") {
            kind = "foes";
        }
        var kind_shape = $('select#' + kind + '_shape').val();
        if (kind_shape == "rund") {
            $('input#' + kind + '_height').addClass("hidden");
            $('input#' + kind + '_width').attr("placeholder", "Durchmesser in px");
            $('input#' + kind + '_width').removeClass("hidden");
            $('input#' + kind + '_color').removeClass("hidden");
        } else if (kind_shape == "eigene Form hochladen (im nächsten Schritt)") {
            $('input#' + kind + '_height').addClass("hidden");
            $('input#' + kind + '_width').addClass("hidden");
            $('input#' + kind + '_color').addClass("hidden");
        } else if (kind_shape == "eckig") {
            $('input#' + kind + '_height').removeClass("hidden");
            $('input#' + kind + '_width').removeClass("hidden");
            $('input#' + kind + '_color').removeClass("hidden");
            $('input#' + kind + '_width').attr("placeholder", "Breite in px");
        }
    }
}

function changePage(id) {
    if ($('input#gamename').val() != ''){
        $('h3#createCaption').text('Erstelle jetzt ' + $('input#gamename').val());
    }else {
        $('h3#createCaption').text('Erstelle nun dein eigenes Spiel');
    }
    if ($('textarea#gamedescription').val() != ''){
        $('p#createDescription').text($('textarea#gamedescription').val());
    }else {
        $('p#createDescription').text('');
    }

    if(id == 1){
        $('div#seite1').removeClass("hidden");
        $('div#seite2').addClass("hidden");
        $('div#seite3').addClass("hidden");
        $('div#seite4').addClass("hidden");
    } else if(id == 2){
        $('div#seite1').addClass("hidden");
        $('div#seite2').removeClass("hidden");
        $('div#seite3').addClass("hidden");
        $('div#seite4').addClass("hidden");
    } else if(id == 3){
        $('div#seite1').addClass("hidden");
        $('div#seite2').addClass("hidden");
        $('div#seite3').removeClass("hidden");
        $('div#seite4').addClass("hidden");
    }else if(id == 4){
        $('div#seite1').addClass("hidden");
        $('div#seite2').addClass("hidden");
        $('div#seite3').addClass("hidden");
        $('div#seite4').removeClass("hidden");
    } else {
        $('div#seite1').removeClass("hidden");
        $('div#seite2').addClass("hidden");
        $('div#seite3').addClass("hidden");
        $('div#seite4').addClass("hidden");
    }
}

function changePreviewDirection(id){
    if (id == "vertical"){
        $('canvas#gamePreview').removeClass("horizontal");
        $('canvas#gamePreview').addClass("vertical");
    }else if(id == "horizontal"){
        $('canvas#gamePreview').removeClass("vertical");
        $('canvas#gamePreview').addClass("horizontal");
    }else{
        $('canvas#gamePreview').removeClass("vertical");
        $('canvas#gamePreview').addClass("horizontal");
    }
}

/* EventListener */
window.onload = function() {
    if (document.getElementById('files') != undefined) {
        document.getElementById('files').addEventListener('change',
            handleFileSelect, false);
    }
}