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
