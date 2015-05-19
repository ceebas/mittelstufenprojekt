var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
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
// Parameter die generisch seinen müssen
gameStarted = false,
background = new Image(),
backX = 0,
backY = 0;
background.src = "img/horizontal_preview.png";

if (options.gameParameter.scrollldirection == "horizontal"){
    canvas.width = 600;
    canvas.height = 400;
}else{
    canvas.width = 400;
    canvas.height = 600;
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
    if (options.gameParameter.selfscroll) {
        multiplier = options.gameParameter.scrollspeed * 2;

        score = Math.floor(score + multiplier);
        if (options.gameParameter.scrollldirection == "horizontal") {
            backX -= multiplier;
        } else {
            backY += multiplier;
        }
    }
    if (options.gameParameter.scrollldirection == "horizontal") {
        options.gameParameter.player.y += options.gameParameter.player.gravity * options.gameParameter.player.speed /** 5*/; 
    } else{
        options.gameParameter.player.y += options.gameParameter.player.gravity * options.gameParameter.player.speed /** 5*/;
    }
    //Tastaturabfragen
    if (keys[87] || keys[38]) {    //up
        options.gameParameter.player.y -= 8;
        options.gameParameter.player.velY = -options.gameParameter.player.speed * 50;
    }
    if (keys[83] || keys[40]) {    //down
        options.gameParameter.player.y += 8;
        options.gameParameter.player.velY = options.gameParameter.player.speed * 50;
    }
    if (keys[65] || keys[37]) {    //left
        options.gameParameter.player.x -= 8;
        options.gameParameter.player.velY = options.gameParameter.player.speed * 50;
    }
    if (keys[68] || keys[39]) {    //right
        options.gameParameter.player.x += 8;
        options.gameParameter.player.velY = -options.gameParameter.player.speed * 50;
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
    for (var j = 0, l = options.gameParameter.borders.length; j < l; j++) {
        var dir;
        if (options.gameParameter.player.shape == "rund") {
            dir = collides(borders[j],options.gameParameter.player, null);
        } else {
            dir = collision(options.gameParameter.player, borders[j]);
        }
        if (dir === "ture" || dir === "l" || dir === "r" || dir === "b" || dir ===  "t") {
            options.gameParameter.player.velX = 0;
            options.gameParameter.player.velY = 0;
        }
    }

    // Kollision zwischen Shot und Gegner?
    for (var k = 0; k < shots.length; k++) {
        for (var j = 0; j < foes.length; j++) {
            var dir = collision(shots[k], foes[j]);
            if (dir === "b" || dir ===  "t" || dir === "l" || dir === "r") {
                foes[j].lives--;
                shots.splice(k, 1);
            }
        }
       // shots.splice(k, 1);
   }

    // Kollision mit einem Gegner?
    for (var j = 0; j < foes.length; j++) { 
        var dir = collision(options.gameParameter.player, foes[j]);
        if (dir === "l" || dir === "r" || dir === "b" || dir === "t") {
            options.gameParameter.player.lives--;
            options.gameParameter.player.x = 10;
            options.gameParameter.player.y = canvasHeight/2 + options.gameParameter.player.height;
            foes = [];          
            shots = [];
        }
    }

    //Gegner werden erstellt ##
    if (options.gameParameter.foes.enabled && options.gameParameter.selfScroll) {
        if (score % (options.gameOptions.foes.spawnIntervall * 20) == 0) {
            if (options.gameOptions.horizontal) {
                var by = Math.random() * (canvasHeight - 0) + 0;
                foes.push({
                    x: canvasWidth + 10,
                    y: by,
                    width: options.gameOptions.foes.width,
                    height: options.gameOptions.foes.height,
                    color: options.gameOptions.foes.color,
                    lives: 1
                });  
            } else {
                var by = Math.random() * (canvasWidth - 0) + 0;
                foes.push({
                    x: by,
                    y: -10,
                    width: options.gameOptions.foes.width,
                    height: options.gameOptions.foes.height,
                    color: options.gameOptions.foes.color,
                    lives: 1
                });  
            }
        } 
    }
}

function render() {
	//overwrite canvas with new parameter - clear out before!
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Erstmal Canvas sauber machen ... alles leer
    ctx.drawImage(background, backX, backY, canvasWidth, canvasHeight);
    if (options.gameParameter.horizontal) {
        ctx.drawImage(background, backX + canvasWidth - 1, backY, canvasWidth, canvasHeight);
    } else {
        ctx.drawImage(background, backX, backY + canvasHeight - 1, canvasWidth, canvasHeight);
        ctx.drawImage(background, backX, backY - canvasHeight + 1, canvasWidth, canvasHeight);
    }

    for (var s = 0; s < options.gameParameter.borders.length; s++) {
        ctx.fillStyle = "red";
        ctx.fillRect(borders[s].x, borders[s].y, borders[s].width, borders[s].height);
    }

    if (Math.abs(backX) > canvasWidth) {
        // Wurden die Bilder mehr als die Canvas Breite verschoben (egal welche Richtung (abs))
        backX = 0;
        // Dann resetten
    }
    if (Math.abs(backY) > canvasHeight) {
        // Wurden die Bilder mehr als die Canvas Höhe verschoben (egal welche Richtung (abs))
        backY = 0;
        // Dann resetten
    }
    if (options.gameParameter.player.shape == "eckig") {
        ctx.beginPath();
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = '#003300';
        ctx.rect(options.gameParameter.player.x, options.gameParameter.player.y, options.gameParameter.player.width, options.gameParameter.player.height);
        ctx.stroke();
        ctx.fillStyle = options.gameParameter.player.color;
        ctx.fillRect(options.gameParameter.player.x, options.gameParameter.player.y, options.gameParameter.player.width, options.gameParameter.player.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    } else if (options.gameParameter.player.shape == "rund") {
        var radius = options.gameParameter.player.width;
        ctx.beginPath();
        ctx.arc(options.gameParameter.player.x, options.gameParameter.player.y + (options.gameParameter.player.width / 2), radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = options.gameParameter.player.color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    } else {
        //ctx.drawImage(options.gameParameter.player.images.normal, options.gameParameter.player.x, options.gameParameter.player.y, options.gameParameter.player.width, options.gameParameter.player.height);  
    }

    //Schüsse werden gezeichnet
    for (var s = 0; s < shots.length; s++) {
        ctx.fillStyle = options.gameParameter.player.shoot.color;
        if (options.gameParameter.player.shoot.shape == "eckig") {
          if (options.gameParameter.player.shape == "rund") {
            if (options.gameParameter.horizontal) {
                    // Schuss: Eckig / Player: Rund / Horizontal
                    ctx.fillRect(shots[s].x + options.gameParameter.player.width/2 + shots[s].width, shots[s].y + options.gameParameter.player.width/2 - shots[s].height/2, shots[s].width, shots[s].height);
                } else {
                    // Schuss: Eckig / Player: Rund / Vertikal
                    ctx.fillRect(shots[s].x - options.gameParameter.player.width/2 , shots[s].y - options.gameParameter.player.width/2 - shots[s].height - 4, shots[s].width, shots[s].height); 
                }                
            } else if (options.gameParameter.player.shape == "eckig") {
             if (options.gameParameter.horizontal) {
                    // Schuss: Eckig / Player: Eckig / Horizontal
                    ctx.fillRect(shots[s].x + options.gameParameter.player.width, shots[s].y + options.gameParameter.player.height/2 - shots[s].height/2, shots[s].width, shots[s].height);
                } else {
                    // Schuss: Eckig / Player: Eckig / Vertikal
                    ctx.fillRect(shots[s].x, shots[s].y - options.gameParameter.player.height/2, shots[s].width, shots[s].height);
                }  
                
            }

        } else if (options.gameParameter.player.shoot.shape == "rund") {
            var radius = shots[s].width / 2;
            ctx.beginPath();
            if (options.gameParameter.player.shape == "rund") {
                if (options.gameParameter.horizontal) {
                    // Schuss: Rund / Player: Rund / Horizontal
                    ctx.arc(shots[s].x + shots[s].width + options.gameParameter.player.width/2 + 4, shots[s].y + options.gameParameter.player.width/2, radius, 0, 2 * Math.PI, false);
                } else { 
                    // Schuss: Rund / Player: Rund / Vertikal   
                    ctx.arc((shots[s].x + shots[s].width/2) - options.gameParameter.player.width/2, shots[s].y - options.gameParameter.player.width/2 - radius - 4, radius, 0, 2 * Math.PI, false);
                }            
            }else if (options.gameParameter.player.shape == "eckig"){
                if (options.gameParameter.horizontal) {
                    // Schuss: Rund / Player: Eckig / Horizontal
                    ctx.arc(shots[s].x + options.gameParameter.player.width + shots[s].width/2, shots[s].y + options.gameParameter.player.height/2 , radius, 0, 2 * Math.PI, false);
                } else {
                    // Schuss: Rund / Player: Eckig / Vertikal       
                    ctx.arc(shots[s].x + shots[s].width/2, shots[s].y - radius - 3, radius, 0, 2 * Math.PI, false);
                }
            }
            ctx.fill();
        }
        
        // Schussrichtung festlegen je nach Horizontal / Vertikal
        if (options.gameParameter.horizontal){
            shots[s].x += options.gameParameter.player.shoot.speed + 7;
        }else{
            shots[s].y -= options.gameParameter.player.shoot.speed + 7;
        } 

        
        if (shots[s].y < (-50)) {
            shots.splice(s,1);
        }
    }

    //Gegner werden gezeichnet
    if (options.gameParameter.selfScroll) {
        for (var s = 0; s < foes.length; s++) {
            if (options.gameParameter.horizontal) {
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
                    if (foes[s].y > (canvasHeight + 20)) {
                        foes.splice(s,1);
                    }
                }    
            }    
        }
    }
}
function shot() {
  shots.push({
    x: options.gameParameter.player.x + options.gameParameter.player.width / 2 - 6,
    y: options.gameParameter.player.y,
    width: 10,
    height: 10
});
}

function sendScoreRequest() {
	//post request with score object
	scoreSend = true;
}

//Tastaturanschläge abfangen
document.body.addEventListener("keydown", function(e) {
  if (gameStarted) {
    e.preventDefault();
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

//circle.width == radius!!
function collides (rect, circle, collide_inside) {
    // compute a center-to-center vector
    var half = { x: rect.w/2, y: rect.h/2 };
    var center = {
        x: circle.x - (rect.x+half.x),
        y: circle.y - (rect.y+half.y)};
        
    // check circle position inside the rectangle quadrant
    var side = {
        x: Math.abs (center.x) - half.x,
        y: Math.abs (center.y) - half.y};
    if (side.x >  circle.width || side.y >  circle.width) // outside
        return false; 
    if (side.x < -circle.width && side.y < -circle.width) // inside
        return collide_inside;
    if (side.x < 0 || side.y < 0) // intersects side or corner
        return true;

    // circle is near the corner
    return side.x*side.x + side.y*side.y  < circle.width*circle.width;
}

function rectCircleCollision(circle,rect) {
    var distX = Math.abs(circle.x - rect.x-rect.width/2);
    var distY = Math.abs(circle.y - rect.y-rect.height/2);
    if (distX > (rect.width/2 + circle.width)) { 
        return false; 
    }
    if (distY > (rect.height/2 + circle.width)) { 
        return false; 
    }

    if (distX <= (rect.width/2)) { 
        return true; 
    } 
    if (distY <= (rect.height/2)) { 
        return true; 
    }
    var dx=distX-rect.width/2;
    var dy=distY-rect.height/2;
    return (dx*dx+dy*dy<=(circle.width*circle.width));
}