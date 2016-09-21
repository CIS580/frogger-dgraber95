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
