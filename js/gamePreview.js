var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
canvas = document.getElementById('gamePreview'),
ctx = canvas.getContext('2d'),
keys = {},
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
gameOptions = {
    horizontal: true,
    selfScroll: false,
    scrollspeed: 0.5,
    borders: {
        top: false,
        bottom: true,
        left: false,
        right: false
    },
    foes: {
        enabled: true,
        lives: 1,
        speed: 5,
        spawnIntervall : 1,
        spawn: "zufall",
        width: 20,
        height: 30,
        shape: "eckig",
        color: "#88FF00"
    },
    player: {
        lives : 1,
        x : canvasWidth/2,
        y : canvasHeight - 30,
        dead: false,
        speed: 1,
        gravity: 0,
        width: 20,
        height: 30,
        shape: "eckig",
        color: "#B4D455",
        shoot: {
            enabled: false,
            speed: 1,
            interval: 10,
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
backY = 0,
borders = [{
    position: "bottom",
    x: -500,
    y: canvasHeight - 5,
    width: canvasWidth + 500,
    height: 5
}];
background.src = "./img/horizontal_preview.png";
canvas.width = canvasWidth;
canvas.height = canvasHeight;
//canvas.tabIndex = 1;

function changeBorder(id) {
    //Betreffende Border suchen und aus Array entfernen
    function popBorder() {
        for (var i = 0; i < borders.length; i++) {
            if (borders[i].position == id) {
                borders.splice(i,1);
            }
        }
    }
    if (id == "top"){
        if ($('input#border_top').prop("checked")){
            gameOptions.borders.top = true;
            borders.push({
                position: "top",
                x: -500,
                y: 0,
                width: canvasWidth + 500,
                height: 5
            });
        }else{
            gameOptions.borders.top = false;
            popBorder();
        }
    } else if (id == "bottom"){
        if ($('input#border_bottom').prop("checked")){
            gameOptions.borders.bottom = true;
            borders.push({
                position: "bottom",
                x: -500,
                y: canvasHeight - 5,
                width: canvasWidth + 500,
                height: 5
            });
        }else{
            gameOptions.borders.bottom = false;
            popBorder();
        }
    } else if (id == "left"){
        if ($('input#border_left').prop("checked")){
            gameOptions.borders.left = true;
            borders.push({ //left
                position: "left",
                x: 0,
                y: 0,
                width: 5,
                height: canvasHeight
            });
        }else{
            gameOptions.borders.left = false;
            popBorder();
        }
    } else if (id == "right"){
        if ($('input#border_right').prop("checked")){
            gameOptions.borders.right = true;
            borders.push({ //right
                position: "right",
                x: canvasWidth - 5,
                y: 5,
                width: 5,
                height: canvasHeight
            });
        }else{
            gameOptions.borders.right = false;
            popBorder();
        }
    }
}

function changePreviewCanvas(id) {
    if (id == "vertical"){
        gameOptions.horizontal = false;
        canvasWidth = 400;
        canvasHeight = 600;
        gameOptions.player.x = canvasWidth/2;
        gameOptions.player.y = canvasHeight - gameOptions.player.height;

        // Schleife für Setzen des neuen Borders (Vertikal)
        for (var i = 0; i < borders.length; i++) {
            if (borders[i].position == "bottom") {
                borders[i].width = canvasWidth;
                borders[i].height = 5; 
                borders[i].x = 0;
                borders[i].y = canvasHeight - 5;
            }
        }
    } else{
        gameOptions.horizontal = true;
        canvasWidth = 600;
        canvasHeight = 400;
        gameOptions.player.x = gameOptions.player.width;
        gameOptions.player.y = canvasHeight - gameOptions.player.height;

        // Schleife für Setzen des neuen Borders (Vertikal)
        for (var i = 0; i < borders.length; i++) {
            if (borders[i].position == "bottom") {
                borders[i].width = canvasWidth;
                borders[i].height = 5; 
                borders[i].x = 0;
                borders[i].y = canvasHeight - 5;
            }
        }

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
        gameOptions.player.width = parseInt($('input#player_width').val());
    }

    if ($('input#player_height').val() != ''){
        gameOptions.player.height = parseInt($('input#player_height').val());
    }
    gameOptions.player.color = $('input#player_color').val();
    //gameOptions.player.images.normal.src = "http://placehold.it/"+gameOptions.player.width+"x"+gameOptions.player.height;

}

function getFoeOptions() {
    gameOptions.foes.speed = $('input#foes_speed').val();
    gameOptions.foes.spawnIntervall = $('input#foes_intervall').val();
    gameOptions.foes.gravity = $('input#foes_gravity').val();
    gameOptions.foes.shape = $('select#foes_shape').val();
    gameOptions.foes.spawn = $('select#foes_spawn').val();
    if ($('input#foes_width').val() != ''){
        gameOptions.foes.width = $('input#foes_width').val();
    }

    if ($('input#foes_height').val() != ''){
        gameOptions.foes.height = $('input#foes_height').val();
    }
    gameOptions.foes.color = $('input#foes_color').val();
}


function setFoesEnabled(value) {
    gameOptions.foes.enabled = value;
    gameOptions.foes.speed = 5;
    if (gameOptions.foes.enabled == false) {
        for (var s = 0; s < foes.length; s++) {
            foes.splice(s,1);
            foes = [];
        }
    }
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
        multiplier = gameOptions.scrollspeed * 2;
        

        score = Math.floor(score + 1);
        if (gameOptions.horizontal) {
            backX -= multiplier;
        } else {
            backY += multiplier;
        }
    }
    if (gameOptions.horizontal) {
        gameOptions.player.y += gameOptions.player.gravity * gameOptions.player.speed /** 5*/;
    } else {
        gameOptions.player.y += gameOptions.player.gravity * gameOptions.player.speed /** 5*/;
    }
    //Tastaturabfragen
    if (keys[87] || keys[38]) {    //up
       // if (!gameOptions.selfScroll && gameOptions.player.y <= 50) {
            //backY += 16;
            //gameOptions.player.y -= 8;
            //gameOptions.player.velY = -gameOptions.player.speed * 50;
        //} else if (!gameOptions.selfScroll && gameOptions.player.y >= canvasHeight - 50) {
            //backY -= 16;
            //gameOptions.player.y += 8;
            //gameOptions.player.velY = gameOptions.player.speed * 50;
       // } else {
            gameOptions.player.y -= 8;
            gameOptions.player.velY = -gameOptions.player.speed * 50;
        //}
    }
    if (keys[83] || keys[40]) {    //down
        gameOptions.player.y += 8;
        gameOptions.player.velY = gameOptions.player.speed * 50;
    }
    if (keys[65] || keys[37]) {    //left
        if (!gameOptions.selfScroll && gameOptions.player.x >= canvasWidth - 100 && gameOptions.horizontal) {
            backX += 16;
            gameOptions.player.x -= 8;
            gameOptions.player.velY = gameOptions.player.speed * 50;
        } else if (!gameOptions.selfScroll && gameOptions.player.x <= 100 && gameOptions.horizontal) {
            backX += 16;
        } else {
            gameOptions.player.x -= 8;
            gameOptions.player.velY = gameOptions.player.speed * 50;
        }
    }
    if (keys[68] || keys[39]) {    //right
        if (!gameOptions.selfScroll && gameOptions.player.x >= canvasWidth - 100 && gameOptions.horizontal ) {
            backX -= 16;
        } else if (!gameOptions.selfScroll && gameOptions.player.x <= 100 && gameOptions.horizontal) {
            backX -= 16;
            gameOptions.player.x += 8;
            gameOptions.player.velY = -gameOptions.player.speed * 50;
        } else {
            gameOptions.player.x += 8;
            gameOptions.player.velY = -gameOptions.player.speed * 50;
        }
    }
    if (keys[32] ) {    //Leertaste
        if (gameOptions.player.shoot.enabled) {
            if (shotVar > gameOptions.player.shoot.interval) {
                shot();
                shotVar = 0;
            } else {
                shotVar++;
            }
        }
    }

    // Kollision mit der Grenze?
    for (var j = 0, l = borders.length; j < l; j++) {
        var dir;
        if (gameOptions.player.shape == "rund") {
            dir = collides(borders[j],gameOptions.player, null);
        } else {
            dir = collision(gameOptions.player, borders[j]);
        }
        if (dir === "true" || dir === "l" || dir === "r" || dir === "b" || dir ===  "t") {
            gameOptions.player.velX = 0;
            gameOptions.player.velY = 0;
        }
    }

    // Kollision zwischen Shot und Gegner?
    for (var k = 0; k < shots.length; k++) {
        for (var j = 0; j < foes.length; j++) {
            var dir = collision(shots[k], foes[j]);
            if (dir === "b" || dir ===  "t" || dir === "l" || dir === "r") {
                foes[j].lives--;
                shots.splice(k, 1);
                foes.splice(j,1);
            }
        }
       // shots.splice(k, 1);
    }

    // Kollision mit einem Gegner?
    for (var j = 0; j < foes.length; j++) { 
        var dir = collision(gameOptions.player, foes[j]);
        if (dir === "l" || dir === "r" || dir === "b" || dir === "t") {
            gameOptions.player.lives--;
            gameOptions.player.x = 10;
            gameOptions.player.y = canvasHeight/2 + gameOptions.player.height;
            foes = [];          
            shots = [];
        }
    }

    //Gegner werden erstellt
    if (gameOptions.foes.enabled && gameOptions.selfScroll) {
        if (score % (gameOptions.foes.spawnIntervall * 20) == 0) {
            if (gameOptions.horizontal) {
                var by = Math.random() * (canvasHeight - 0) + 0;
                foes.push({
                    x: canvasWidth + 10,
                    y: by,
                    width: gameOptions.foes.width,
                    height: gameOptions.foes.height,
                    color: gameOptions.foes.color,
                    lives: 1
                });  
            } else {
                var by = Math.random() * (canvasWidth - 0) + 0;
                foes.push({
                    x: by,
                    y: -10,
                    width: gameOptions.foes.width,
                    height: gameOptions.foes.height,
                    color: gameOptions.foes.color,
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
    
    if (gameOptions.horizontal) {
        ctx.drawImage(background, backX + canvasWidth - 1, backY, canvasWidth, canvasHeight);
        ctx.drawImage(background, backX - canvasWidth + 1, backY, canvasWidth, canvasHeight);
    } else {
        if (gameOptions.selfScroll) {
            ctx.drawImage(background, backX, backY + canvasHeight - 1, canvasWidth, canvasHeight);
            ctx.drawImage(background, backX, backY - canvasHeight + 1, canvasWidth, canvasHeight);
        }
             
        //ctx.drawImage(background, backX + canvasWidth - 1, backY, canvasWidth, canvasHeight);
        //ctx.drawImage(background, backX - canvasWidth + 1, backY, canvasWidth, canvasHeight);
    }

    for (var s = 0; s < borders.length; s++) {
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
    if (gameOptions.player.shape == "eckig") {
        ctx.beginPath();
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = '#003300';
        ctx.rect(gameOptions.player.x, gameOptions.player.y, gameOptions.player.width, gameOptions.player.height);
        ctx.stroke();
        ctx.fillStyle = gameOptions.player.color;
        ctx.fillRect(gameOptions.player.x, gameOptions.player.y, gameOptions.player.width, gameOptions.player.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    } else if (gameOptions.player.shape == "rund") {
        var radius = gameOptions.player.width;
        ctx.beginPath();
        ctx.arc(gameOptions.player.x, gameOptions.player.y + (gameOptions.player.width / 2), radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = gameOptions.player.color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    } else {
        //ctx.drawImage(gameOptions.player.images.normal, gameOptions.player.x, gameOptions.player.y, gameOptions.player.width, gameOptions.player.height);  
    }

    //Schüsse werden gezeichnet
    for (var s = 0; s < shots.length; s++) {
        ctx.fillStyle = gameOptions.player.shoot.color;
        if (gameOptions.player.shoot.shape == "eckig") {
          if (gameOptions.player.shape == "rund") {
            if (gameOptions.horizontal) {
                    // Schuss: Eckig / Player: Rund / Horizontal
                    ctx.fillRect(shots[s].x + gameOptions.player.width/2 + shots[s].width, shots[s].y + gameOptions.player.width/2 - shots[s].height/2, shots[s].width, shots[s].height);
                } else {
                    // Schuss: Eckig / Player: Rund / Vertikal
                    ctx.fillRect(shots[s].x - gameOptions.player.width/2 , shots[s].y - gameOptions.player.width/2 - shots[s].height - 4, shots[s].width, shots[s].height); 
                }                
            } else if (gameOptions.player.shape == "eckig") {
               if (gameOptions.horizontal) {
                    // Schuss: Eckig / Player: Eckig / Horizontal
                    ctx.fillRect(shots[s].x + gameOptions.player.width, shots[s].y + gameOptions.player.height/2 - shots[s].height/2, shots[s].width, shots[s].height);
                } else {
                    // Schuss: Eckig / Player: Eckig / Vertikal
                    ctx.fillRect(shots[s].x, shots[s].y - gameOptions.player.height/2, shots[s].width, shots[s].height);
                }  
                
            }

        } else if (gameOptions.player.shoot.shape == "rund") {
            var radius = shots[s].width / 2;
            ctx.beginPath();
            if (gameOptions.player.shape == "rund") {
                if (gameOptions.horizontal) {
                    // Schuss: Rund / Player: Rund / Horizontal
                    ctx.arc(shots[s].x + shots[s].width + gameOptions.player.width/2 + 4, shots[s].y + gameOptions.player.width/2, radius, 0, 2 * Math.PI, false);
                } else { 
                    // Schuss: Rund / Player: Rund / Vertikal   
                    ctx.arc((shots[s].x + shots[s].width/2) - gameOptions.player.width/2, shots[s].y - gameOptions.player.width/2 - radius - 4, radius, 0, 2 * Math.PI, false);
                }            
            }else if (gameOptions.player.shape == "eckig"){
                if (gameOptions.horizontal) {
                    // Schuss: Rund / Player: Eckig / Horizontal
                    ctx.arc(shots[s].x + gameOptions.player.width + shots[s].width/2, shots[s].y + gameOptions.player.height/2 , radius, 0, 2 * Math.PI, false);
                } else {
                    // Schuss: Rund / Player: Eckig / Vertikal       
                    ctx.arc(shots[s].x + shots[s].width/2, shots[s].y - radius - 3, radius, 0, 2 * Math.PI, false);
                }
            }
            ctx.fill();
        }
        
        // Schussrichtung festlegen je nach Horizontal / Vertikal
        if (gameOptions.horizontal){
            shots[s].x += gameOptions.player.shoot.speed + 7;
        }else{
            shots[s].y -= gameOptions.player.shoot.speed + 7;
        } 

        
        if (shots[s].y < (-50)) {
            shots.splice(s,1);
        }
    }

    //Gegner werden gezeichnet
    if (gameOptions.selfScroll) {
        for (var s = 0; s < foes.length; s++) {
            if (gameOptions.horizontal) {
                if (foes[s].lives == 1) {
                    ctx.fillStyle = foes[s].color;
                    ctx.fillRect(foes[s].x, foes[s].y, foes[s].width, foes[s].height);
                    foes[s].x -= gameOptions.foes.speed;
                    if (foes[s].x < -20) {
                        foes.splice(s,1);
                    }
                 }   
            } else {
                if (foes[s].lives == 1) {
                    ctx.fillStyle = foes[s].color;
                    ctx.fillRect(foes[s].x, foes[s].y, foes[s].width, foes[s].height);
                    foes[s].y += gameOptions.foes.speed / 2;
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
    x: gameOptions.player.x + gameOptions.player.width / 2 - 6,
    y: gameOptions.player.y,
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