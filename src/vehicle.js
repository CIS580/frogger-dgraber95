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
