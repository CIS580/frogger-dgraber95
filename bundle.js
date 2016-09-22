(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

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

var game = new Game(canvas, update, render);
var player = new Player({x: 4, y: 240});
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
        state = 'speed';
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
    if(state =='speed')
    {
      speed_up();
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
  player.update(elapsedTime);

  for(var i = 0; i < lanes.length; i ++) {
    lanes[i].update(elapsedTime);
    log_lanes[i].update(elapsedTime);
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

  for(var i = 0; i < lanes.length; i ++) {
    lanes[i].render(ctx);
    log_lanes[i].render(ctx);
  }
  player.render(elapsedTime, ctx);
}

},{"./game.js":2,"./lane.js":3,"./log_lane.js":5,"./player.js":6,"./vehicle.js":7}],2:[function(require,module,exports){
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
/**
 * @module exports the lane class
 */
module.exports = exports = Lane;

/* Classes */
const Vehicle = require('./vehicle.js');

/**
 * @constructor Lane
 * Creates a new lane object
 * @param {int} laneNum left lane number of this lane (0-3 left to right)
 */
function Lane(laneNum) {
  this.wait = 1200;
  this.timer = 0;
  this.vehicles = [];
  this.laneNum = laneNum;
  switch(laneNum){
      case 0:
        this.x = 76;
        this.speed = Math.random()*0.5 + 0.5;
        break;
      case 1:
        this.x = 146;
        this.speed = Math.random()*0.4 + 0.75;
        break;
      case 2:
        this.x = 216;
        this.speed = Math.random()*0.4 + 0.75;
        break;        
      case 3:
        this.x = 286;
        this.speed = Math.random()*0.5 + 0.5;
        break;
  }
}


/**
 * @function updates the Lane object
 */
Lane.prototype.update = function(elapsedTime) {
    this.timer += elapsedTime;
    var max_vehicles;
    if(this.speed < 9) {
        max_vehicles = (7-this.speed);
    }
    else {
        max_vehicles = 1;
    }

    if(this.timer >= this.wait && this.vehicles.length <= max_vehicles) {
        this.timer = 0;
        var minimumWait = 400/elapsedTime/this.speed*100;
        this.wait = (Math.random()*(5/this.speed)) * 1000 + minimumWait;
        if(this.laneNum == 0 || this.laneNum == 1){
            this.vehicles.push(new Vehicle(this, -150));
        }
        else{
            this.vehicles.push(new Vehicle(this, 480));
        }
    }

    for(var i = 0; i < this.vehicles.length; i++){
        this.vehicles[i].update(elapsedTime, this.speed);
    }

    if(this.vehicles.length != 0 && this.vehicles[0].isOffScreen) {
        this.vehicles.splice(0, 1);
    }
}

/**
 * @function renders all vehicles in the car lane into the provided context
 * {CanvasRenderingContext2D} ctx - the context to render into
 */
Lane.prototype.render = function(ctx) {
  for(var i = 0; i < this.vehicles.length; i++){
      this.vehicles[i].render(ctx);
  }
}

},{"./vehicle.js":7}],4:[function(require,module,exports){
/**
 * @module exports the log class
 */
module.exports = exports = Log;


/**
 * @constructor Log
 * Creates a new log object
 * @param {int} lane - log lane number the log belongs in (0 - 3, left to right)
 */
function Log(lane, yPos) {
  var log_number = Math.floor(Math.random() * 3);
  this.spritesheet  = new Image();
  this.spritesheet.src = 'assets/log/log_' + log_number + '.png';
  switch(log_number) {
      case 0:
        this.img_height = 482;
        break;
      case 1:
        this.img_height = 629;
        break;
      case 2:
        this.img_height = 747;
        break;
  }
  this.img_width = 360;
  this.scaling_factor = (this.img_width)/64;
  this.width  = (this.img_width)/this.scaling_factor;
  this.height = this.img_height/this.scaling_factor;
  this.laneNum = lane.laneNum;
  this.y = yPos;
  this.isOffScreen = false;
  this.x = lane.x;
  this.speed = lane.speed;
}

/**
 * @function updates the log object
 */
Log.prototype.update = function(elapsedTime, speed) {
    this.speed = speed;
    if(this.y > 480 + this.height) {
        this.isOffScreen = true;
    } else {
        this.y += this.speed;
    }
}

/**
 * @function renders the log into the provided context
 * {CanvasRenderingContext2D} ctx - the context to render into
 */
Log.prototype.render = function(ctx) {
  ctx.drawImage(
    //image
    this.spritesheet,
    //source rectangle
    0, 0, this.img_width, this.img_height,
    //destination rectangle
    this.x, this.y, this.width* 2, this.height
  );
}

},{}],5:[function(require,module,exports){
/**
 * @module exports the log lane class
 */
module.exports = exports = LogLane;

/* Classes */
const Log = require('./log.js');

/**
 * @constructor Lane
 * Creates a new lane object
 * @param {int} laneNum left lane number of this lane (0-3 left to right)
 */
function LogLane(laneNum) {
  this.wait = 1500;
  this.timer = 0;
  this.logs = [];
  this.laneNum = laneNum;
  this.speed = Math.random()+0.5;
  switch(laneNum){
      case 0:
        this.x = 424;
        break;
      case 1:
        this.x = 494;
        break;
      case 2:
        this.x = 564;
        break;        
      case 3:
        this.x = 634;
        break;
  }
}


/**
 * @function updates the LogLane object
 */
LogLane.prototype.update = function(elapsedTime) {
    this.timer += elapsedTime;

    if(this.timer >= this.wait) {
        this.timer = 0;
        var minimumWait = 400/elapsedTime/this.speed*100;
        this.wait = (Math.random()*(5/this.speed)) * 1000 + minimumWait;
        this.logs.push(new Log(this, -380));
    }

    for(var i = 0; i < this.logs.length; i++){
        this.logs[i].update(elapsedTime, this.speed);
    }

    if(this.logs.length != 0 && this.logs[0].isOffScreen) {
        this.logs.splice(0, 1);
    }
}

/**
 * @function renders all logs in the log lane into the provided context
 * {CanvasRenderingContext2D} ctx - the context to render into
 */
LogLane.prototype.render = function(ctx) {
  for(var i = 0; i < this.logs.length; i++){
      this.logs[i].render(ctx);
  }
}

},{"./log.js":4}],6:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;
const MS_JUMP_FRAME = 1000/32;
const PIXELS_PER_JUMP_H = 70;
const PIXELS_PER_JUMP_V = 50;
const PPF = 14;
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
      console.log("X: " + this.x + "    Y: " + this.y);
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
      this.pixels_moved += PPF;
      if(this.pixels_moved <= PIXELS_PER_JUMP_H)
        this.x += PPF;
      if(this.timer >= MS_JUMP_FRAME && this.pixels_moved > PIXELS_PER_JUMP_H/NUM_JUMP_FRAMES) {
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
      this.pixels_moved += PPF;      
      if(this.pixels_moved <= PIXELS_PER_JUMP_H)
        this.x -= PPF;
      if(this.timer >= MS_JUMP_FRAME && this.pixels_moved > PIXELS_PER_JUMP_H/NUM_JUMP_FRAMES) {
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
      this.pixels_moved += PPF;      
      if(this.pixels_moved <= PIXELS_PER_JUMP_V)      
        this.y += PPF;
      if(this.timer >= MS_JUMP_FRAME && this.pixels_moved > PIXELS_PER_JUMP_V/NUM_JUMP_FRAMES) {
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
      this.pixels_moved += PPF;      
      if(this.pixels_moved <= PIXELS_PER_JUMP_V)      
        this.y -= PPF;
      if(this.timer >= MS_JUMP_FRAME && this.pixels_moved > PIXELS_PER_JUMP_V/NUM_JUMP_FRAMES) {
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

},{}],7:[function(require,module,exports){
/**
 * @module exports the vehicle class
 */
module.exports = exports = Vehicle;


/**
 * @constructor Vehicle
 * Creates a new vehicle object
 * @param {int} lane - lane number the vehicle belongs in (0 - 3, left to right)
 */
function Vehicle(lane, yPos) {
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
  this.laneNum = lane.laneNum;
  this.y = yPos;
  this.wait = (Math.random() + 0.5) * 1000;
  this.isOffScreen = false;
  this.x = lane.x;
  this.speed = lane.speed;
  switch(this.laneNum) {
      case 0:
      case 1:
        this.draw_x = this.img_width/2;
        break;
      case 2:
      case 3:
        this.draw_x = 0;
        break;        
  }
}

/**
 * @function updates the Vehicle object
 */
Vehicle.prototype.update = function(elapsedTime, speed) {
  this.speed = speed;
  switch(this.laneNum){
    case 0:
    case 1:
        if(this.y > 480 + this.height) {
            this.isOffScreen = true;
        } else {
            this.y += this.speed;
        }
        break;
    case 2:
    case 3:
        if(this.y < 0 - this.height) {
            this.isOffScreen = true;
        } else {
            this.y -= this.speed;
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
