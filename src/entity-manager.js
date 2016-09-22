module.exports = exports = EntityManager;

function EntityManager(width, height, cellSize) {
  this.laneSize = cellSize;
  this.height = height;
  this.widthInCells = Math.ceil(width / cellSize);
  this.cells = [];
  for(var i = 0; i < this.widthInCells; i++) {
    this.cells[i] = [];
  }
  this.cells[-1] = [];
}

function getIndex(x) {
  var x = Math.floor(x / this.laneSize);
  return x;
}

EntityManager.prototype.addEntity = function(entity){
  var index = getIndex.call(this, entity.x);
  this.cells[index].push(entity);
  entity._cell = index;
}

EntityManager.prototype.updateEntity = function(entity){
  var index = getIndex.call(this, entity.x);
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
        if((i+1) % self.widthInCells != 0) {
          self.cells[i+1].forEach(function(entity2) {
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
                   entity1.y > entity2.y + entity2.height ||
                   entity2.x + entity2.width < entity1.x ||
                   entity2.x > entity1.x + entity1.width ||
                   entity2.y + entity2.height < entity1.y ||
                   entity2.y > entity1.y + entity1.height);
  if(collides) {
    callback(entity1, entity2);
  }
}

EntityManager.prototype.renderCells = function(ctx) {
  for(var x = 0; x < this.widthInCells; x++) {
      ctx.strokeStyle = '#333333';
      ctx.strokeRect(x * this.laneSize, this.height, this.laneSize, this.height);
  }
}

EntityManager.prototype.renderBoundingBoxes = function(ctx){
  
  this.cells.forEach(function(cell){
    cell.forEach(function(entity){
      ctx.strokeStyle = entity.strokeStyle;
      ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
    });
  });
}
