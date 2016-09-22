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
