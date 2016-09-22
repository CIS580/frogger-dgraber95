"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Vehicle = require('./vehicle.js');
const Lane = require('./lane.js');
const LogLane = require('./log_lane.js');
const EntityManager = require('./entity-manager.js');

/* Global variables */
var canvas = document.getElementById('screen');
var background = new Image();
background.src = 'assets/background_assets/frogger_background.jpg';

var entities = new EntityManager(canvas.width, canvas.height, 76);
var game = new Game(canvas, update, render);
var player = new Player({x: 4, y: 240});
entities.addEntity(player);
var lanes = [];
var log_lanes = [];
for(var i = 0; i < 4; i ++) {
  lanes.push(new Lane(i));
  log_lanes.push(new LogLane(i));
}

// var vehicle = new Vehicle(0, 100);
var state = '';

window.onkeydown = function(event) {
  switch(event.keyCode) {
    // RIGHT
    case 39:
    case 68:
      if(player.state == "idle") {
        player.state = "right";
        player.frame = -1;
      }
      break;
    // LEFT
    case 37:
    case 65:
      if(player.state == "idle") {
        player.state = "left";
        player.frame = -1;
      }
      break;
    // DOWN
    case 40:
    case 83:
      if(player.state == "idle") {
        player.state = "down";
        player.frame = -1;
      }
      break;
    // UP
    case 87:
      if(state == ''){
        game.pause(false);
      }
      break;
    case 38:
      if(player.state == "idle") {
        player.state = "up";
        player.frame = -1;
      }
      break;
  }
}

window.onkeyup = function(event){
  switch(event.keyCode){
    case 87:
    if(state =='paused')
    {
      game.pause(false);
      state = '';
    }
  }
}

function speed_up(){
  for(var i = 0; i < lanes.length; i++) {
    lanes[i].speed += 1;
    log_lanes[i].speed += 0.2;
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
  player.update(elapsedTime, entities);

  for(var i = 0; i < lanes.length; i ++) {
    lanes[i].update(elapsedTime, entities);
    log_lanes[i].update(elapsedTime, entities);
  }

  entities.collide(function(entity1, entity2) {
    game.pause(true);
  });
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
  for(var i = 0; i < lanes.length; i ++) {
    lanes[i].render(ctx);
    log_lanes[i].render(ctx);
  }
  player.render(elapsedTime, ctx);
}
