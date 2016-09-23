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
function LogLane(laneNum, level) {
  this.wait = 1500;
  this.timer = 0;
  this.logs = [];
  this.laneNum = laneNum;
  this.speed = Math.random() + 0.5;
  switch(laneNum){
      case 0:
        this.x = 424;
        this.logs.push(new Log(this, Math.random()*400));    
        break;
      case 1:
        this.x = 494;
        this.logs.push(new Log(this, Math.random()*400));           
        break;
      case 2:
        this.x = 564;
        this.logs.push(new Log(this, Math.random()*400));           
        break;        
      case 3:
        this.x = 634;
        this.logs.push(new Log(this, Math.random()*400));           
        break;
  }
}

LogLane.prototype.increaseSpeed = function() {
    this.speed += 0.3;
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
        if((this.laneNum == 0 || this.laneNum == 2) && (this.logs.length == 0 || 
            this.logs[this.logs.length - 1].y > 0)){
            var new_log = new Log(this, -200);
            this.logs.push(new_log);
        }
        else if (this.laneNum == 1 || this.laneNum == 3 && this.logs.length == 0 || 
            this.logs[this.logs.length - 1].y < 480 - this.logs[this.logs.length - 1].height){
            var new_log = new Log(this, 480);
            this.logs.push(new_log);
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
