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
  this.img_width = 180;
  this.scaling_factor = (this.img_width)/64;
  this.width  = (this.img_width)/this.scaling_factor;
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
    this.draw_x, 0, this.img_width, this.img_height,
    //destination rectangle
    this.x, this.y, this.width, this.height
  );
}
