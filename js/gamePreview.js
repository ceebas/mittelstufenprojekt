var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var canvas = document.getElementById('gamePreview');
var ctx = canvas.getContext('2d');
var selfScrollState, scrollSpeedValue, border_top, border_bottom, border_left, border_right,horizontal, CanvasHeight, canvasWidth;


function changeBorder(id){
    if (id == "top"){
        if ($('input#border_top').prop("checked")){
            border_top = true;
        }else{
            border_top = false;
        }
    } else if (id == "bottom"){
        if ($('input#border_bottom').prop("checked")){
            border_bottom = true;
        }else{
            border_bottom = false;
        }
    } else if (id == "left"){
        if ($('input#border_left').prop("checked")){
            border_left = true;
        }else{
            border_left = false;
        }
    } else if (id == "right"){
        if ($('input#border_right').prop("checked")){
            border_right = true;
        }else{
            border_right = false;
        }
    }
}

function changePreviewCanvas(id){
    if (id == "vertical"){
        horizontal = false;
        canvasWidth = 230;
        CanvasHeight = 300;
    }else if(id == "horizontal"){
        horizontal = true;
        canvasWidth = 300;
        CanvasHeight = 150;
    }else{
        horizontal = true;
        canvasWidth = 300;
        CanvasHeight = 150;
    }
}

function setSelfscroll(){
    if ($('input#selfscroll').prop("checked")){
        selfScrollState = true;
        scrollSpeedValue = $('input#scroll_speed').val();
    }else{
        selfScrollState = false;
        scrollSpeedValue = 0;
    }
}

function getPlayerOptions(){
    player_speed = $('input#player_speed').val();
    player_gravity = $('input#player_gravity').val();
    player_shape = $('input#player_shape').val();
    if ($('input#player_width').val() != ''){
        player_width = $('input#player_width').val();
    }else{
        player_width = 20;
    }

    if ($('input#player_height').val() != ''){
        player_height = $('input#player_height').val();
    }else{
        player_height = 30;
    }
    player_color = $('input#player_color').val();
}






// Parameter die generisch seinen müssen
var gameStarted = false,
selfScroll = selfScrollState,
scrollspeed = scrollSpeedValue;
borders = {
    top: border_top,
    bottom: border_bottom,
    left: border_left,
    right: border_right
}
foes = {
  moving: false,
  speed: 0,
  gravity: 0,
  width: 50,
  height: 50,
  shape: "eckig",
  color: "#123456"
}
player = {
    speed: 1,
    gravity: 1,
    width: 50,
    height: 75,
    shape: "eckig",
    color: "#123456",
    shoot: {
        enabled: false,
        speed: 0,
        shape: "eckig",
        color: "#123456"
    }
};








//Spielbeginn

function mainLoop() {
	if (!gameStarted) {
		renderMenu();
		if (!scoreSend) {
			sendScoreRequest();
		}
	} else {
		update();
		render();
	}
	requestAnimationFrame(mainLoop);
}

//Schleife wird aufgerufen, wenn Seite fertig geladen
window.addEventListener("load", function(){
  mainLoop();
});

function update() {
	//update gameparameter, Frame by Frame
}

function render() {
	//overwrite canvas with new parameter - clear out before!
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