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
  this.wait = 0;
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
    // var max_vehicles;
    // if(this.speed < 8) {
    //     max_vehicles = 1;
    // }
    // else {
    //     max_vehicles = (7-this.speed);
    // }

    if(this.timer >= this.wait) {
        this.timer = 0;
        var minimumWait = 400/elapsedTime/this.speed*100;
        this.wait = (Math.random()*(5/this.speed)) * 1000 + minimumWait;
        if(this.laneNum == 0 || this.laneNum == 1){
            this.logs.push(new Log(this, -380));
        }
        else{
            this.logs.push(new Log(this, 480));
        }
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
