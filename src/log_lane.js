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
