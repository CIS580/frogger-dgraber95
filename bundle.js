(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Vehicle = require('./vehicle.js');

/* Global variables */
var canvas = document.getElementById('screen');
var background = new Image();
background.src = 'assets/background_assets/frogger_background.jpg';

var game = new Game(canvas, update, render);
var player = new Player({x: 8, y: 240})
var vehicle = new Vehicle(0);

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
    case 38:
    case 87:
      if(player.state == "idle") {
        player.state = "up";
        player.frame = -1;
      }
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
  player.update(elapsedTime);
  // TODO: Update the game objects
  vehicle.update();
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
  // ctx.fillStyle = "lightblue";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
  vehicle.render(ctx);
}

},{"./game.js":2,"./player.js":3,"./vehicle.js":4}],2:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;
  
  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],3:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;
const MS_JUMP_FRAME = 1000/16;
const PIXELS_PER_JUMP = 68;
const NUM_JUMP_FRAMES = 4;
/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position) {
  this.state = "idle";
  this.x = position.x;
  this.y = position.y;
  this.width  = 64;
  this.height = 64;
  this.spritesheet  = new Image();
  this.spritesheet.src = encodeURI('assets/player_sprites/PlayerSprite0.png');
  this.timer = 0;
  this.frame = 0;
  this.pixels_moved = 0;
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
  switch(this.state) {
    case "idle":
      this.timer += time;
      if(this.timer > MS_PER_FRAME) {
        this.timer = 0;
        this.frame += 1;
        if(this.frame > NUM_JUMP_FRAMES - 1) this.frame = 0;
      }
      break;
    // TODO: Implement your player's update by state


    case "right":
      this.timer += time;
      this.pixels_moved += 4;
      if(this.pixels_moved <= PIXELS_PER_JUMP)
        this.x += 4;
      if(this.timer >= MS_JUMP_FRAME && this.pixels_moved > PIXELS_PER_JUMP/NUM_JUMP_FRAMES) {
        this.timer = 0;
        this.frame += 1;
        if(this.frame > NUM_JUMP_FRAMES - 1) {
          this.pixels_moved = 0;
          this.frame = 0;
          this.state = "idle";
        }
      }
      break;
    case "left":
      this.timer += time;
      this.pixels_moved += 4;      
      if(this.pixels_moved <= PIXELS_PER_JUMP)
        this.x -= 4;
      if(this.timer >= MS_JUMP_FRAME && this.pixels_moved > PIXELS_PER_JUMP/NUM_JUMP_FRAMES) {
        this.timer = 0;
        this.frame += 1;
        if(this.frame > NUM_JUMP_FRAMES - 1) {
          this.pixels_moved = 0;          
          this.frame = 0;
          this.state = "idle";
        }
      }
      break;
    case "down":
      this.timer += time;
      this.pixels_moved += 4;      
      if(this.pixels_moved <= PIXELS_PER_JUMP)      
        this.y += 4;
      if(this.timer >= MS_JUMP_FRAME && this.pixels_moved > PIXELS_PER_JUMP/NUM_JUMP_FRAMES) {
        this.timer = 0;
        this.frame += 1;
        if(this.frame > NUM_JUMP_FRAMES - 1) {
          this.pixels_moved = 0;          
          this.frame = 0;
          this.state = "idle";
        }
      }
      break;
    case "up":
      this.timer += time;
      this.pixels_moved += 4;      
      if(this.pixels_moved <= PIXELS_PER_JUMP)      
        this.y -= 4;
      if(this.timer >= MS_JUMP_FRAME && this.pixels_moved > PIXELS_PER_JUMP/NUM_JUMP_FRAMES) {
        this.timer = 0;
        this.frame += 1;
        if(this.frame > NUM_JUMP_FRAMES - 1) {
          this.pixels_moved = 0;          
          this.frame = 0;
          this.state = "idle";
        }
      }
      break;
    default:
      this.state = "idle";   


  }
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  switch(this.state) {
    case "idle":
      ctx.drawImage(
        // image
        this.spritesheet,
        // source rectangle
        this.frame * 64, 64, this.width, this.height,
        // destination rectangle
        this.x, this.y, this.width, this.height
      );
      break;

    case "right":
    case "left":
    case "down":
    case "up":
      ctx.drawImage(
        //image
        this.spritesheet,
        //source rectangle
        this.frame * 64, 0, this.width, this.height,
        //destination rectangle
        this.x, this.y, this.width, this.height
      );
      break;    
  }
}

},{}],4:[function(require,module,exports){
/**
 * @module exports the vehicle class
 */
module.exports = exports = Vehicle;


/**
 * @constructor Vehicle
 * Creates a new vehicle object
 * @param {int} lane - lane number the vehicle belongs in (0 - 3, left to right)
 */
function Vehicle(lane) {
  this.newCarImage();
  this.lane = lane;
  switch(lane) {
      case 0:
        this.x = 76;
        this.y = 0 - this.height;
        this.draw_x = this.img_width/2;
        break;
  }
}

Vehicle.prototype.newCarImage = function() {
  var car_number = Math.floor(Math.random() * 11);
  this.spritesheet  = new Image();
  this.spritesheet.src = 'assets/cars/car_' + car_number + '.png';
  switch(car_number) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
        this.img_height = 307;
        break;
      case 5: 
      case 6:
      case 7:
      case 8:
        this.img_height = 362;
        break;
      case 9:
      case 10:
        this.img_height = 373;
        break;
  }
  this.img_width = 360;
  this.scaling_factor = (this.img_width/2)/64;
  this.width  = (this.img_width/2)/this.scaling_factor;
  this.height = this.img_height/this.scaling_factor;
}

/**
 * @function updates the Vehicle object
 */
Vehicle.prototype.update = function() {
  switch(this.lane){
    case 0:
    case 1:
        if(this.y > 480 + this.height) {
            this.newCarImage();
            this.y = 0 - this.height;
        } else {
            this.y += 2;
        }
        break;
    case 2:
    case 3:
        if(this.y < 0 - this.height) {
            this.newCarImage();
            this.y = 480;
        } else {
            this.y -= 2;
        }
    break;
  }
}

/**
 * @function renders the vehicle into the provided context
 * {CanvasRenderingContext2D} ctx - the context to render into
 */
Vehicle.prototype.render = function(ctx) {
  ctx.drawImage(
    //image
    this.spritesheet,
    //source rectangle
    this.draw_x, 0, this.img_width/2, this.img_height,
    //destination rectangle
    this.x, this.y, this.width, this.height
  );
}

},{}]},{},[1]);
