"use strict;"

const COUNTDOWN = 2400;

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Vehicle = require('./vehicle.js');
const Lane = require('./lane.js');
const LogLane = require('./log_lane.js');

/* Global variables */
var canvas = document.getElementById('screen');
var background = new Image();
background.src = 'assets/background_assets/frogger_background.jpg';
var p_key = false;
var state = 'ready';
var countDown = COUNTDOWN;
var level = 1;
var gravestones = [];
var gravestone = new Image()
gravestone.src = 'assets/player_sprites/rip.png';
var game = new Game(canvas, update, render);
var player = new Player({x: 4, y: 240});
var lanes = [];
var log_lanes = [];
for(var i = 0; i < 4; i ++) {
  lanes.push(new Lane(i, level));
  log_lanes.push(new LogLane(i, level));
}

window.onkeydown = function(event) {
  switch(event.keyCode) {
    // RIGHT
    case 39:
    case 68:
      event.preventDefault();
      if(player.state == 'idle' && state == 'running') {
        player.state = 'right';
        player.frame = -1;
      }
      break;
    // LEFT
    case 37:
    case 65:
      event.preventDefault();
      if(player.state == 'idle' && state == 'running') {
        player.state = 'left';
        player.frame = -1;
      }
      break;
    // DOWN
    case 40:
    case 83:
      event.preventDefault();
      if(player.state == 'idle' && state == 'running') {
        player.state = 'down';
        player.frame = -1;
      }
      break;
    // UP
    case 87:
    case 38:
      event.preventDefault();
      if(player.state == 'idle' && state == 'running') {
        player.state = 'up';
        player.frame = -1;
      }
      break;
    // P
    case 80:
      event.preventDefault();
      if(!p_key){
        p_key = true;
        if(state == 'paused') state = 'running';
        else if(state == 'running') state = 'paused';
      }
      break;
  }
}

window.onkeyup = function(event){
  switch(event.keyCode){
    case 80:
      p_key = false;
      break;
  }
}


/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  update:
  switch(state) {
    case 'ready': 
        // Update logs & cars
        countDown -= elapsedTime;
        if(countDown <= 0){
          countDown = COUNTDOWN;
          state = 'running';
        }
        player.update(elapsedTime);
        for(var i = 0; i < lanes.length; i ++) {
          lanes[i].update(elapsedTime);
          log_lanes[i].update(elapsedTime);
        }
      break;

    case 'paused':
      // display 'paused' + score
      break;

    case 'gameover':
      for(var i = 0; i < lanes.length; i ++) {
        lanes[i].update(elapsedTime);
        log_lanes[i].update(elapsedTime);
      }
      // Display gameover & score
      break;

    case 'running': 
      player.update(elapsedTime);

      if(player.x < 0 || player.y + 20 < 0 || player.y + player.height > 480)
      {
        death();
      }

      // Check if player reached other side
      if(player.lane >= 10)
      {
        level += 1;
        state = 'ready';
        for(var i = 0; i < lanes.length; i ++) {
          lanes[i].increaseSpeed();
          log_lanes[i].increaseSpeed();
        }
        player.restart();
        break;
      }

      // Update logs & cars
      for(var i = 0; i < lanes.length; i ++) {
        lanes[i].update(elapsedTime);
        log_lanes[i].update(elapsedTime);
      }

      // Check contact with cars
      for(var i = 0; i < lanes.length; i ++) {
        for(var j = 0; j < lanes[i].vehicles.length; j++)
        {
          if(player.isCollidingWithCar(lanes[i].vehicles[j])){
            death();
            break update;
          }
        }
      }

      // Check contact with logs
      logs:
      if(player.state == 'idle' && player.lane >= 6 && player.lane < 10){
        for(var j = 0; j < log_lanes[player.lane - 6].logs.length; j++)
        {
          if(player.isRidingLog(log_lanes[player.lane - 6].logs[j])){
            player.logSpeed = log_lanes[player.lane - 6].speed;
            break logs;
          }
        }
        death();
      }
      break;
  }

window.onblur = function(){
  state = 'paused';
}

function death() {
  player.lives -= 1;
  gravestones.push({x: player.x, y: player.y});
  if(player.lives == 0) state = 'gameover';
  else {
    state = 'ready';
  }          
  player.restart();
}


}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  for(var i = 0; i < gravestones.length; i++){
    ctx.drawImage(gravestone, gravestones[i].x, gravestones[i].y, 30, 45);    
  }
  for(var i = 0; i < lanes.length; i ++) {
    lanes[i].render(ctx);
    log_lanes[i].render(ctx);
  }
  if(state != 'gameover'){
    player.render(elapsedTime, ctx);
    if(state != 'paused'){
      ctx.fillStyle = 'white';
      ctx.font = "30px Lucida Console";
      ctx.fillText("Score: " + (level - 1) * 100, 500, 470);      
    }
  }
  if(state == 'gameover'){
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.font = "50px Lucida Console";
		ctx.fillStyle = "red";
		ctx.textAlign = "center";
		ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2); 
		ctx.font = "25px Lucida Console";
		ctx.fillStyle = "black";
		ctx.fillText("Final Score: " + (level - 1) * 100, canvas.width/2, canvas.height/2 + 30);
  }
  else if(state == 'paused'){
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.font = "50px Lucida Console";
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		ctx.fillText("PAUSED", canvas.width/2, canvas.height/2); 
		ctx.font = "25px Lucida Console";
		ctx.fillStyle = "black";
		ctx.fillText("Score: " + (level - 1) * 100, canvas.width/2, canvas.height/2 + 30);
  }
  else if(state == 'ready'){
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.font = "50px Lucida Console";
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		ctx.fillText(Math.ceil(countDown/800),  canvas.width/2, canvas.height/2); 
		ctx.font = "25px Lucida Console";
		ctx.fillStyle = "black";
		ctx.fillText("Level: " + level, canvas.width/2, canvas.height/2 + 30);
  }

}
