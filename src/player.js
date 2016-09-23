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
  this.spriteNum = 0;
  this.spritesheet  = new Image();
  this.spritesheet.src = encodeURI('assets/player_sprites/PlayerSprite0.png');
  this.timer = 0;
  this.frame = 0;
  this.pixels_moved = 0;
  this.lane = 0;
  this.logSpeed = 0;
  this.lives = 3;
  this.livesImg = new Image();
  this.livesImg.src = encodeURI('assets/player_sprites/lives.png');
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time, entities) {
  switch(this.lane){
    case 6:
    case 8:
      this.y += this.logSpeed;
    break;

    case 7:
    case 9:
      this.y -= this.logSpeed;
    break;
  }

  if(this.state != "idle") this.logSpeed = 0;

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
          this.lane += 1;
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
          this.lane -= 1;
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

Player.prototype.isCollidingWithCar = function(vehicle) {
  return !(this.x + this.width < vehicle.x ||
                   this.x > vehicle.x +vehicle.width ||
                   this.y + this.height - 10 < vehicle.y ||
                   this.y + 24 > vehicle.y + vehicle.height);
}

Player.prototype.isRidingLog = function(log) {
  return !(this.x + this.width < log.x ||
                   this.x > log.x + log.width ||
                   this.y + this.height - 20 < log.y ||
                   this.y + 65 > log.y +log.height);
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  ctx.drawImage(
    // image
    this.livesImg,
    // source rectangle
    831 * (3 - this.lives), 0, 831 * this.lives, 720,
    // destination rectangle
    600, 440, 40 * this.lives, 40
  );
  switch(this.state) {
    case "idle":
      ctx.drawImage(
        // image
        this.spritesheet,
        // source rectangle
        this.frame * 64, 80, this.width, this.height,
        // destination rectangle
        this.x, this.y + 16, this.width, this.height
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


/**
 * @function restart the player object
 * {}
 */
Player.prototype.restart = function(time, entities) {
  this.x = 4;
  this.y = 240;
  this.state = 'idle';
  this.timer = 0;
  this.frame = 0;
  this.pixels_moved = 0;
  this.lane = 0;
  this.logSpeed = 0;  
}
