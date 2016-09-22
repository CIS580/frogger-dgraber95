(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./entity-manager.js":2,"./game.js":3,"./lane.js":4,"./log_lane.js":6,"./player.js":7,"./vehicle.js":8}],2:[function(require,module,exports){
module.exports = exports = EntityManager;

function EntityManager(width, height, cellSize) {
  this.cellSize = cellSize;
  this.widthInCells = Math.ceil(width / cellSize);
  this.heightInCells = Math.ceil(height / cellSize);
  this.cells = [];
  this.numberOfCells = this.widthInCells * this.heightInCells;
  for(var i = 0; i < this.numberOfCells; i++) {
    this.cells[i] = [];
  }
  this.cells[-1] = [];
}

function getIndex(x, y) {
  var x = Math.floor(x / this.cellSize);
  var y = Math.floor(y / this.cellSize);
  if(x < 0 ||
     x >= this.widthInCells ||
     y < 0 ||
     y >= this.heightInCells
  ) return -1;
  return y * this.widthInCells + x;
}

EntityManager.prototype.addEntity = function(entity){
  var index = getIndex.call(this, entity.x, entity.y);
  this.cells[index].push(entity);
  entity._cell = index;
}

EntityManager.prototype.updateEntity = function(entity){
  var index = getIndex.call(this, entity.x, entity.y);
  // If we moved to a new cell, remove from old and add to new
  if(index != entity._cell) {
    if(this.cells[entity._cell] == undefined){
      var stop = true;
    }    
    var cellIndex = this.cells[entity._cell].indexOf(entity);
    if(cellIndex != -1) this.cells[entity._cell].splice(cellIndex, 1);
    this.cells[index].push(entity);
    entity._cell = index;
  }
}

EntityManager.prototype.removeEntity = function(entity) {
  var cellIndex = this.cells[entity._cell].indexOf(entity);
  if(cellIndex != -1) this.cells[entity._cell].splice(cellIndex, 1);
  entity._cell = undefined;
}

EntityManager.prototype.collide = function(callback) {
  var self = this;
  this.cells.forEach(function(cell, i) {
    // test for collisions
    cell.forEach(function(entity1) {
      // check for collisions with cellmates
      cell.forEach(function(entity2) {
        if(entity1 != entity2) checkForCollision(entity1, entity2, callback);

        // check for collisions in cell to the right
        if(i % (self.widthInCells - 1) != 0) {
          self.cells[i+1].forEach(function(entity2) {
            checkForCollision(entity1, entity2, callback);
          });
        }

        // check for collisions in cell below
        if(i < self.numberOfCells - self.widthInCells) {
          self.cells[i+self.widthInCells].forEach(function(entity2){
            checkForCollision(entity1, entity2, callback);
          });
        }

        // check for collisions diagionally below and right
        if(i < self.numberOfCells - self.withInCells && i % (self.widthInCells - 1) != 0) {
          self.cells[i+self.widthInCells + 1].forEach(function(entity2){
            checkForCollision(entity1, entity2, callback);
          });
        }
      });
    });
  });
}

function checkForCollision(entity1, entity2, callback) {
  var collides = !(entity1.x + entity1.width < entity2.x ||
                   entity1.x > entity2.x + entity2.width ||
                   entity1.y + entity1.height < entity2.y ||
                   entity1.y > entity2.y + entity2.height);
  if(collides) {
    callback(entity1, entity2);
  }
}

EntityManager.prototype.renderCells = function(ctx) {
  for(var x = 0; x < this.widthInCells; x++) {
    for(var y = 0; y < this.heightInCells; y++) {
      ctx.strokeStyle = '#333333';
      ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
    }
  }
}

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
Lane.prototype.update = function(elapsedTime, entities) {
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
        this.wait = (Math.random()*(6/this.speed)) * 1000 + minimumWait;
        if(this.laneNum == 0 || this.laneNum == 1){
            var new_vehicle = new Vehicle(this, -150);
            this.vehicles.push(new_vehicle);
            entities.addEntity(new_vehicle);
        }
        else{
            var new_vehicle = new Vehicle(this, 480);
            this.vehicles.push(new_vehicle);
            entities.addEntity(new_vehicle);
        }
    }

    for(var i = 0; i < this.vehicles.length; i++){
        this.vehicles[i].update(elapsedTime, this.speed);
        entities.updateEntity(this.vehicles[i]);
    }

    if(this.vehicles.length != 0 && this.vehicles[0].isOffScreen) {
        entities.removeEntity(this.vehicles[0]);
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

},{"./vehicle.js":8}],5:[function(require,module,exports){
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
  this.img_width = 128;
  this.scaling_factor = (this.img_width)/64;
  this.width  = (this.img_width)/this.scaling_factor;
  this.height = this.img_height/this.scaling_factor/2;
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
  switch(this.laneNum){
    case 0:
    case 2:
        if(this.y > 480 + this.height) {
            this.isOffScreen = true;
        } else {
            this.y += this.speed;
        }
        break;
    case 1:
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
    this.x, this.y, this.width, this.height
  );
}

},{}],6:[function(require,module,exports){
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
LogLane.prototype.update = function(elapsedTime, entities) {
    this.timer += elapsedTime;

    if(this.timer >= this.wait) {
        this.timer = 0;
        var minimumWait = 800/elapsedTime/this.speed*100;
        this.wait = (Math.random()*(3/this.speed)) * 1000 + minimumWait;
        if(this.laneNum == 0 || this.laneNum == 2){
            var new_log = new Log(this, -200);
            this.logs.push(new_log);
            entities.addEntity(new_log);
        }
        else{
            var new_log = new Log(this, 480);
            this.logs.push(new_log);
            entities.addEntity(new_log);
        }        
    }

    for(var i = 0; i < this.logs.length; i++){
        this.logs[i].update(elapsedTime, this.speed);
        entities.updateEntity(this.logs[i]);
    }

    if(this.logs.length != 0 && this.logs[0].isOffScreen) {
        entities.removeEntity(this.logs[0]);
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

},{"./log.js":5}],7:[function(require,module,exports){
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
Player.prototype.update = function(time, entities) {
  entities.updateEntity(this);
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

},{}],8:[function(require,module,exports){
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
