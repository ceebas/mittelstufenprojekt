var requestAnimationFrame = window.requestAnimationFrame || 
                            window.mozRequestAnimationFrame || 
                            window.webkitRequestAnimationFrame || 
                            window.msRequestAnimationFrame,
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');
var keys = {},
    shots = [],
    foes = [],
    shotVar = 10,
    score = 0,
    multiplier = 0,
    canvasHeight = 400, 
    canvasWidth = 600,
    scoreSend,
    points = 0,
    // Parameter die generisch seinen müssen
    gameStarted = false,
    player_x = canvasWidth / 2,
    player_y = canvasHeight/2,
    playerVel = 1,
    //Border
    borderX = 0,
    borderY = 0,
    borderWidth = 0,
    borderHeight = 0,
    borderArray = [],
    shots = [],
    background = new Image(),
    backX = 0,
    backY = 0;
background.src = "img/horizontal_preview.png";

if (options.gameParameter.scrolldirection == "horizontal"){
    canvas.width = 600;
    canvas.height = 400;
}else{
    canvas.width = 400;
    canvas.height = 600;
}

function noBackground(){
    if (options.gameParameter.scrolldirection == "horizontal"){
        background.src = "img/horizontal_preview.png";
    }else{
        background.src = "img/vertical_preview.png";
    }
}

//Spielbeginn

function mainLoop() {
	if (!gameStarted) {
         //gameStarted = true;
        update();
        render();        
		/*renderMenu();
		if (!scoreSend) {
			sendScoreRequest();
		}*/

	} else {
		update();
		render();
        requestAnimationFrame(mainLoop);
	}	
}

function renderMenu() {

};

function sendScoreRequest(){
    var req = new XMLHttpRequest();
    var data = { score: Math.floor(points), gameId: gameId};
    req.open('POST', '/submitScore');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(data));
    backX = 0;
    backY = 0;
    points = 0;
    scoreSend = true;
}

//Schleife wird aufgerufen, wenn Seite fertig geladen
window.addEventListener("load", function(){
  createBorders();  
  mainLoop();
});

function update() {


    if (options.gameParameter.selfscroll) {

        multiplier = (options.gameParameter.scrollspeed / 10) * 2;
        var tempMultiplier = options.gameParameter.scrollspeed * 2;

        score = Math.floor(score + (multiplier * 2));
        if (options.gameParameter.scrolldirection == "horizontal") {
            backX -= multiplier;
        } else {
            backY += multiplier;
        }
    }
    if (options.gameParameter.scrolldirection == "horizontal") {
        player_y += options.gameParameter.player.gravity * options.gameParameter.player.speed /** 5*/; 
    } else{
        player_y += options.gameParameter.player.gravity * options.gameParameter.player.speed /** 5*/;
    }
    //Tastaturabfragen
    if (keys[87] || keys[38]) {    //up
        player_y -= playerVel * options.gameParameter.player.speed;
    }
    if (keys[83] || keys[40]) {    //down
        player_y += playerVel * options.gameParameter.player.speed;
    }
    if (keys[65] || keys[37]) {    //left
        player_x -= playerVel * options.gameParameter.player.speed;
    }
    if (keys[68] || keys[39]) {    //right
        player_x += playerVel * options.gameParameter.player.speed;
    }
    if (keys[32] ) {    //Leertaste
        if (options.gameParameter.player.shoot.enabled) {
            if (shotVar == 10) {
                shot();
                shotVar = 0;
            } else {
                shotVar++;
            }
        }
    }

    // Kollision mit der Grenze?
    for (var j = 0, l = borderArray.length; j < l; j++) {
        var dir = collisionPlayerBorder(options.gameParameter.player, borderArray[j]);
        if (dir === "l" || dir === "r" || dir === "b" || dir ===  "t") {
            //alert("kollison mit wand: "+dir);
            //playerVel = 0;

            if (dir === "b") {
                player_y = canvas.height - options.gameParameter.player.size.height
            }
            if (dir === "t") {
                player_y = 0
            }
            if (dir === "l") {
                player_x = 0
            }
            if (dir === "r") {
                player_x = canvas.width - options.gameParameter.player.size.width
            }

        }else{
            //playerVel = 1;
        }
    }

    // Kollision zwischen Shot und Gegner?
    for (var k = 0; k < shots.length; k++) {
        for (var j = 0; j < foes.length; j++) {
            var dir = collision(shots[k], foes[j]);
            if (dir === "b" || dir ===  "t" || dir === "l" || dir === "r") {
                foes[j].lives--;
                shots.splice(k, 1);
                //console.log("1");
            }
        }
       // shots.splice(k, 1);
   }

    // Kollision mit einem Gegner?
    for (var j = 0; j < foes.length; j++) { 
        var dir = collisionPlayerBorder(options.gameParameter.player, foes[j]);
        if (dir === "l" || dir === "r" || dir === "b" || dir === "t") {
            player_x = 10;
            player_y = (canvas.height / 2) + parseInt(options.gameParameter.player.size.height);
            foes = [];          
            shots = [];
            gameStarted = false;
            sweetAlert("Game Over!", "Du hast " +Math.floor(points) +" Punkte erreicht.", "error");
            sendScoreRequest();
            //points = 0;
            if (gameStarted){
                scoreSend = false;
            }
        }
    }

    //Gegner werden erstellt ##
    if (options.gameParameter.selfscroll) {
        if (score % (parseInt(options.gameParameter.foes.SpawnIntervall) * 20) == 0) {
            if (options.gameParameter.scrolldirection == "horizontal") {
                var by = Math.random() * (canvas.height - 0) + 0;
                foes.push({
                    x: canvas.width + 10,
                    y: by,
                    width: options.gameParameter.foes.size.width,
                    height: options.gameParameter.foes.size.height,
                    color: options.gameParameter.foes.color,
                    lives: 1
                });  
            } else {
                var by = Math.random() * (canvas.width - 0) + 0;
                foes.push({
                    x: by,
                    y: -10,
                    width: options.gameParameter.foes.size.width,
                    height: options.gameParameter.foes.size.height,
                    color: options.gameParameter.foes.color,
                    lives: 1
                });  
            }
        } 
    }
}

function render() {
	//overwrite canvas with new parameter - clear out before!
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Erstmal Canvas sauber machen ... alles leer
    ctx.drawImage(background, backX, backY, canvas.width, canvas.height);
    if (options.gameParameter.scrolldirection == "horizontal") {
        ctx.drawImage(background, backX + canvas.width - 1, backY, canvas.width, canvas.height);
        points += Math.floor(backX * -1)/100;
    } else {
        ctx.drawImage(background, backX, backY + canvas.height - 1, canvas.width, canvas.height);
        ctx.drawImage(background, backX, backY - canvas.height + 1, canvas.width, canvas.height);
        points += Math.floor(backY)/100;
    }





    if (Math.abs(backX) > canvas.width) {
        // Wurden die Bilder mehr als die Canvas Breite verschoben (egal welche Richtung (abs))
        backX = 0;
        // Dann resetten
    }
    if (Math.abs(backY) > canvas.height) {
        // Wurden die Bilder mehr als die Canvas Höhe verschoben (egal welche Richtung (abs))
        backY = 0;
        // Dann resetten
    }
        ctx.beginPath();
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = '#003300';
        ctx.rect(player_x, player_y, options.gameParameter.player.size.width, options.gameParameter.player.size.height);
        ctx.stroke();
        ctx.fillStyle = options.gameParameter.player.color;
        ctx.fillRect(player_x, player_y, options.gameParameter.player.size.width, options.gameParameter.player.size.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();


    //Schüsse werden gezeichnet
    for (var s = 0; s < shots.length; s++) {
        ctx.fillStyle = options.gameParameter.player.shoot.color;
        if (options.gameParameter.player.shoot.shape == "eckig") {
        	if (options.gameParameter.player.shape == "eckig") {
            	if (options.gameParameter.scrolldirection == "horizontal") {
                    // Schuss: Eckig / Player: Eckig / Horizontal
                    ctx.fillRect(shots[s].x + parseInt(options.gameParameter.player.size.width), shots[s].y + parseInt(options.gameParameter.player.size.height/2) - shots[s].height/2, shots[s].width, shots[s].height);
                } else {
                    // Schuss: Eckig / Player: Eckig / Vertikal
                    ctx.fillRect(shots[s].x, shots[s].y - parseInt(options.gameParameter.player.size.height/2), shots[s].width, shots[s].height);
                }  
            }

        } else if (options.gameParameter.player.shoot.shape == "rund") {
            var radius = shots[s].width / 2;
            ctx.beginPath();
            if (options.gameParameter.player.shape == "eckig"){
                if (options.gameParameter.scrolldirection == "horizontal") {
                    // Schuss: Rund / Player: Eckig / Horizontal
                    ctx.arc(shots[s].x + parseInt(options.gameParameter.player.size.width) + shots[s].width/2, shots[s].y + parseInt(options.gameParameter.player.size.height/2) , radius, 0, 2 * Math.PI, false);             
               } else {
                    // Schuss: Rund / Player: Eckig / Vertikal       
                    ctx.arc(shots[s].x + shots[s].width/2, shots[s].y - radius - 3, radius, 0, 2 * Math.PI, false);
                }
            }
            ctx.fill();
        }
        
        // Schussrichtung festlegen je nach Horizontal / Vertikal
        if (options.gameParameter.scrolldirection == "horizontal"){
            shots[s].x += parseInt(options.gameParameter.player.shoot.speed) + 7;
        }else{
            shots[s].y -= parseInt(options.gameParameter.player.shoot.speed) + 7;
        } 

        
        if (shots[s].y < (-50)) {
            shots.splice(s,1);
            console.log("2");
        }
    }

    //Gegner werden gezeichnet
    if (options.gameParameter.selfscroll) {
        for (var s = 0; s < foes.length; s++) {
            if (options.gameParameter.scrolldirection == "horizontal") {
                if (foes[s].lives == 1) {
                    ctx.fillStyle = foes[s].color;
                    ctx.fillRect(foes[s].x, foes[s].y, foes[s].width, foes[s].height);
                    foes[s].x -= options.gameParameter.foes.speed;
                    if (foes[s].x < -20) {
                        foes.splice(s,1);
                    }
                 }   
            } else {
                if (foes[s].lives == 1) {
                    ctx.fillStyle = foes[s].color;
                    ctx.fillRect(foes[s].x, foes[s].y, foes[s].width, foes[s].height);
                    foes[s].y += options.gameParameter.foes.speed / 2;
                    if (foes[s].y > (canvas.height + 20)) {
                        foes.splice(s,1);
                    }
                }    
            }    
        }
    }


    // Render points
    ctx.fillStyle=options.gameParameter.player.color;
    ctx.font="20px Arial";
    ctx.fillText("Punkte: " + Math.floor(points),10,20);
    //Wasserzeichen
    ctx.fillStyle="#fff";
    ctx.fillText("We",canvas.width - 110,canvas.height -5);
    ctx.fillStyle="#F00";
    ctx.fillText("♥",canvas.width - 80,canvas.height -5);
    ctx.fillStyle="#fff";
    ctx.fillText("Games",canvas.width - 68,canvas.height -5);

}
function shot() {
  shots.push({
    x: player_x + options.gameParameter.player.size.width / 2 - 6,
    y: player_y,
    width: 10,
    height: 10
});
}


//Tastaturanschläge abfangen
document.body.addEventListener("keydown", function(e) {
  if (gameStarted) {
        e.preventDefault();
    } else {
        gameStarted = true;
        requestAnimationFrame(mainLoop);
    }
    keys[e.keyCode] = true;
    }, false);

document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
}, false);

//Kollisionsabfragen
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

//Kollisionsabfragen
function collisionPlayerBorder(shapeA, shapeB) {
    if (shapeA !== undefined && shapeB !== undefined) {
        var vX = (player_x + (shapeA.size.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (player_y + (shapeA.size.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        hWidths = (shapeA.size.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.size.height / 2) + (shapeB.height / 2),
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

function createBorders(){
        if (options.gameParameter.borders.top) {
            borderX = 0;
            borderY = 0;
            borderWidth = canvas.width;
            borderHeight = 5;
            //ctx.fillStyle = "red";
            ctx.fillRect(borderX, borderY, borderWidth, borderHeight);
            borderArray.push({ //top
                position: "top",
                x: borderX,
                y: borderY,
                width: borderWidth,
                height: borderHeight
            });
        }
        if (options.gameParameter.borders.bottom) {
            borderX = 0;
            borderY = canvas.height - 5;
            borderWidth = canvas.width;
            borderHeight = 5;
            //ctx.fillStyle = "red";
            ctx.fillRect(borderX, borderY, borderWidth, borderHeight);
            borderArray.push({ //bottom
                position: "bottom",
                x: borderX,
                y: borderY,
                width: borderWidth,
                height: borderHeight
            });         
        }
        if (options.gameParameter.borders.right) {
            borderX = canvas.width - 5;
            borderY = 0;
            borderWidth = 5;
            borderHeight = canvas.height;
            //ctx.fillStyle = "red";
            ctx.fillRect(borderX, borderY, borderWidth, borderHeight);
            borderArray.push({ //right
                position: "right",
                x: borderX,
                y: borderY,
                width: borderWidth,
                height: borderHeight
            });
        }
        if (options.gameParameter.borders.left) {
            borderX = 0;
            borderY = 0;
            borderWidth = 5;
            borderHeight = canvas.height;
            //ctx.fillStyle = "red";
            ctx.fillRect(borderX, borderY, borderWidth, borderHeight);
            borderArray.push({ //left
                position: "left",
                x: borderX,
                y: borderY,
                width: borderWidth,
                height: borderHeight
            });
        }
    
}

