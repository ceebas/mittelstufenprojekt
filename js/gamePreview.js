var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
    canvas = document.getElementById('gamePreview'),
    ctx = canvas.getContext('2d'),
    canvasHeight = 300, 
    canvasWidth = 150,
    scoreSend,
    // Parameter die generisch seinen müssen
    gameStarted = false,
    gameOptions = {
        horizontal: true,
        selfScroll: false,
        scrollspeed: 0.5,
        borders: {
            top: false,
            bottom: false,
            left: false,
            right: false
        },
        foes: {
          moving: false,
          speed: 0,
          gravity: 0,
          width: 20,
          height: 30,
          shape: "eckig",
          color: "#88FF00"
        },
        player: {
            x: 0,
            y: 30,
            dead: false,
            speed: 1,
            gravity: 1,
            width: 20,
            height: 30,
            shape: "eckig",
            color: "#000000",
            shoot: {
                enabled: false,
                speed: 0,
                shape: "eckig",
                color: "#FF0000"
            },
            images : {
                normal : "new Image()",
                dead : "new Image()",
            }
        },
    },
    background = new Image(),
    backX = 0,
    backY = 0;
background.src = "./img/horizontal_preview.png";


function changeBorder(id) {
    if (id == "top"){
        if ($('input#border_top').prop("checked")){
           gameOptions.borders.top = true;
        }else{
            gameOptions.borders.top = false;
        }
    } else if (id == "bottom"){
        if ($('input#border_bottom').prop("checked")){
            gameOptions.borders.bottom = true;
        }else{
            gameOptions.borders.bottom = false;
        }
    } else if (id == "left"){
        if ($('input#border_left').prop("checked")){
            gameOptions.borders.left = true;
        }else{
            gameOptions.borders.left = false;
        }
    } else if (id == "right"){
        if ($('input#border_right').prop("checked")){
            gameOptions.borders.right = true;
        }else{
            gameOptions.borders.right = false;
        }
    }
}

function changePreviewCanvas(id) {
    if (id == "vertical"){
        gameOptions.horizontal = false;
        canvasWidth = 230;
        canvasHeight = 300;
        gameOptions.player.x = canvasWidth/2;
        gameOptions.player.y = canvasHeight - gameOptions.player.height;
    } else if (id == "horizontal") {
        gameOptions.horizontal = true;
        canvasWidth = 300;
        canvasHeight = 150;
        gameOptions.player.x = gameOptions.player.width;
        gameOptions.player.y = canvasHeight - gameOptions.player.height;
    } else {
        gameOptions.horizontal = true;
        canvasWidth = 300;
        canvasHeight = 150;
    }
    backX = 0;
    backY = 0;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}
 
function setSelfscroll(value) {
    if ($('input#selfscroll').prop("checked")) {
        gameOptions.selfScroll = true;
        if (value != undefined) {
            gameOptions.scrollspeed = value / 10;
        }
    } else {
        gameOptions.selfScroll= false;
    }
}

function getPlayerOptions(kind, value) {
    gameOptions.player.speed = $('input#player_speed').val();
    gameOptions.player.gravity = $('input#player_gravity').val();
    if (kind == "shape"){
        gameOptions.player.shape = value;
    } else if (kind == "shoot"){
        if ($('input#player_shoot_enable').prop("checked")){
            gameOptions.player.shoot.enabled = true;
            gameOptions.player.shoot.shape = value;
        } 
    }
    if ($('input#player_width').val() != ''){
        gameOptions.player.width = $('input#player_width').val();
    }

    if ($('input#player_height').val() != ''){
        gameOptions.player.height = $('input#player_height').val();
    }
    gameOptions.player.color = $('input#player_color').val();
    gameOptions.player.images.normal.src = "http://placehold.it/"+gameOptions.player.width+"x"+gameOptions.player.height;

}

function getFoeOptions(value) {
    gameOptions.foes.speed = $('input#foes_speed').val();
    gameOptions.foes.gravity = $('input#foes_gravity').val();
    gameOptions.foes.shape = value;
    if ($('input#foes_width').val() != ''){
        gameOptions.foes.width = $('input#foes_width').val();
    }

    if ($('input#foes_height').val() != ''){
        gameOptions.foes.height = $('input#foes_height').val();
    }
    gameOptions.foes.color = $('input#foes_color').val();
}






//Spielbeginn

function mainLoop() {
	/*if (!gameStarted) {
		renderMenu();
		if (!scoreSend) {
			sendScoreRequest();
		}
	} else {*/
		update();
		render();
	//}
	requestAnimationFrame(mainLoop);
}


function renderMenu() {


};

//Schleife wird aufgerufen, wenn Seite fertig geladen
window.addEventListener("load", function(){
  mainLoop();
});

function update() {
    if (gameOptions.selfScroll) {
        var multiplier = gameOptions.scrollspeed * 2;

        if (gameOptions.horizontal) {
            backX -= multiplier;
        } else {
            backY += multiplier;
        }
    }
	//update gameOptions, Frame by Frame
}

function render() {
	//overwrite canvas with new parameter - clear out before!

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Erstmal Canvas sauber machen ... alles leer
    //background.onload = function() {
        ctx.drawImage(background, backX, backY, canvasWidth, canvasHeight);
        if (gameOptions.horizontal) {
            ctx.drawImage(background, backX + canvasWidth - 1, backY, canvasWidth, canvasHeight);
        } else {
            ctx.drawImage(background, backX, backY + canvasHeight - 1, canvasWidth, canvasHeight);
            ctx.drawImage(background, backX, backY - canvasHeight + 1, canvasWidth, canvasHeight);
        }
        // Hintergrundbild das bei Start zu sehen ist
    
        // Hintergrundbild rechts neben Startbild
        if (Math.abs(backX) > canvasWidth) {// Wurden die Bilder mehr als die Canvas Breite verschoben (egal welche Richtung (abs))
            backX = 0;
            // Dann resetten
        }
        if (Math.abs(backY) > canvasHeight) {// Wurden die Bilder mehr als die Canvas Breite verschoben (egal welche Richtung (abs))
            backY = 0;
            // Dann resetten
        }

        /*if (!gameOptions.player.dead) {
            ctx.drawImage(gameOptions.player.images.normal, gameOptions.player.x, gameOptions.player.y, gameOptions.player.width, gameOptions.player.height);
        } else {
            ctx.drawImage(gameOptions.player.images.dead, gameOptions.player.x, gameOptions.player.y, gameOptions.player.width, gameOptions.player.height);
        }*/
    //}    
}

function sendScoreRequest() {
	//post request with score object
	scoreSend = true;
}

//Kollisionsabfrage
function collision(shapeA, shapeB) {
    if (shapeA !== undefined && shapeB !== undefined) {
        var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
            vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
            hWidths = (shapeA.width / 2) + (shapeB.width / 2),
            hHeights = (shapeA.height / 2) + (shapeB.height / 2),
            colDir = null;
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            var oX = hWidths - Math.abs(vX),
                oY = hHeights - Math.abs(vY);
            if (oX >= oY) {
                if (vY > 0) {
                    colDir = "t";
                    shapeA.y += oY;
                } else {
                    colDir = "b";
                    shapeA.y -= oY;
                }
            } else {
                if (vX > 0) {
                    colDir = "l";
                    shapeA.x += oX;
                } else {
                    colDir = "r";
                    shapeA.x -= oX;
                }
            }
            return colDir;
        }
    }
}