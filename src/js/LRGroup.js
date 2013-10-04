/*
 *
 *
 *
 */

function LRGroup(config, parentCanvas){
  var nodes = this.nodes = config.nodes || [];
  this.parentCanvas = parentCanvas;
  this.paper = parentCanvas.el;
  this.config = config;
  this.id = config.id || rndId();
  this.connectors = [];



  this.registerEvent('ungroup', function(){
    console.log('ungroup received');
  }.bind(this));

  this.init();
}


LRGroup.prototype = {
  init: function(){
    var self = this;
    var el;

    if(this.config.rect){
      el = this.el = this.config.rect;
    }
    else {
      el = this.el = this.paper.rect(0,0,0,0);
      el.attr(this.config.style);
    }

    if(this.config.nodeIds){
      this.config.nodeIds.forEach(function(id){
        var node = self.parentCanvas.idMap[id];
        node.addToGroup(self);
        self.nodes.push(node);
      });
    }

    // Add a transparent background fo easier handling
    el.attr('fill', 'transparent');

    var parentCanvas = this.parentCanvas;

    this.updateNodePositions({x: el.attr('x'), y: el.attr('y')});

    // Add drag event listener
    el.drag(this.onDrag.bind(this), this.onDragStart.bind(this), this.onDragStop.bind(this));

    // Add hover event listeners
    el.mouseover(function(){
      if(self.parentCanvas.toolbar.cursorMode === "move"){
      el.attr('stroke-width', 2);
      }
    });
    el.mouseout(function(){
      if(self.parentCanvas.toolbar.cursorMode === "move"){
      el.attr('stroke-width', 1);
      }
    });

    // Add click handlers
    el.click(this.clickHandlers, this);
  },
  clickHandlers: function(ev){
    if(this.parentCanvas.toolbar.cursorMode === "path"){
      this.pathConnector();
    }
  },
  pathConnector: function(){
    if(!this.parentCanvas.firstNode){
      this.parentCanvas.firstNode = this;
      this.select();
    }
    else if(isCircular(this.parentCanvas.firstNode, this)){
      alert("Cannot create circular paths");
      this.parentCanvas.firstNode.unselect();
      this.parentCanvas.firstNode = null;
    }
    else {
      pathCanvas.addConnector({from: this.parentCanvas.firstNode.id, to: this.id});
      this.parentCanvas.firstNode.unselect();
      this.parentCanvas.firstNode = null;
    }
  },
  select: function(){
    this.el.attr('fill-opacity', '100');
    this.el.attr('fill', 'black');
  },
  unselect: function(){
    this.el.attr('fill-opacity', '0');
    this.el.attr('fill', 'white');
  },
  addToGroup: function(node){
    var x = this.el.attr('x');
    var y = this.el.attr('y');

    this.nodes.push(node);
    this.updateNodePositions({x: x, y: y});
    this.updateBoundary();
  },
  removeFromGroup: function(node){
    var idx;

    if(this.nodes.length <= 2){
      this.parentCanvas.removeGroup(this);
    }
    else if((idx = this.nodes.indexOf(node)) > -1) {
      this.nodes.splice(idx, 1);
      node.setPosition({x: node.el.attr('x') + this.el.attr('width'), y: node.el.attr('y')});
      this.updateBoundary();
    }
  },
  updateBoundary: function(){
    var maxNodeWidth = 0;
    var x = this.el.attr('x');
    var y = this.el.attr('y');
    var width, height;

    this.nodes.forEach(function(node){
      maxNodeWidth = Math.max(maxNodeWidth, node.el.attr('width'));
    });

    this.el.attr({
      width: maxNodeWidth + 20,
      height: (this.nodes.length * (NODE_HEIGHT + 10)) + 10
    });

    this.updateNodePositions({x:x, y:y});
  },
  setPosition: function(coords) {
    this.el.attr(coords);
    this.updateBoundary();
  },
  removeAllNodes: function(){
    for(var i = 0, len = this.nodes.length; i < len; i++){
      this.nodes[i].ungroupNode(null, true);
    }
  },
  destroy: function(){
    //remove all nodes from group
    this.removeAllNodes();

    // Destroy all connectors
    var conn = this.connectors;
    while(conn.length){
      conn.pop().destroy();
    }

    this.el.remove();
  },
  onDrag: function(dx, dy){
    if(this.parentCanvas.toolbar.cursorMode === "move"){
      var newCoords = this.getNewCoordinates(this.tempx, this.tempy, dx, dy);

      this.updateNodePositions(newCoords);

      this.el.attr(newCoords);

      this.connectors.forEach(function(conn){
        conn.update();
      });

    }
  },
  onDragStart: function(){
    if(this.parentCanvas.toolbar.cursorMode === "move"){
      this.tempx = this.el.attr("x");
      this.tempy = this.el.attr("y");

      this.el.toFront();
    }
  },

  onDragStop: function(){},
  updateNodePositions: function(groupCoords){
    this.nodes.forEach(function(node, i){
      node.setPosition({
        x: groupCoords.x + 10,
        y: groupCoords.y + (10*(i+1)) + (NODE_HEIGHT * i)
      });
    });
  },
  getNewCoordinates: function(oldx, oldy, dx, dy){
    var paperWidth = this.paper.width;
    var paperHeight = this.paper.height;
    var groupWidth = this.el.attr('width');
    var groupHeight = this.el.attr('height');
    var x = Math.min(Math.max(oldx + dx, BUFFER), paperWidth - groupWidth - BUFFER);
    var y = Math.min(Math.max(oldy + dy, BUFFER), paperHeight - groupHeight - BUFFER);

    return { x: x, y: y};
  },
  fireEvent: function(evStr){
    if(this._registeredEvents[evStr]){
      return this._registeredEvents[evStr]();
    }
    else {
      console.log('No known behavior for:',evStr);
    }
  },
  registerEvent: function(evStr, handler){
    if(!this._registeredEvents) this._registeredEvents = {};

    this._registeredEvents[evStr] = handler;
  },
  _addConnector: function(connector) {
    var conns = this.connectors;
    var connLen = conns.length;

    for(var i = 0; i < conns.length; i++){
      if(conns[i].toNode === connector.toNode || conns[i].fromNode === connector.fromNode){
        this.parentCanvas.removeConnector(conns[i]);
        i--;
      }
    }

    conns.push(connector);
  },
  _removeConnector: function(connector) {
    var connectorList = this.connectors;
    var idx = connectorList.indexOf(connector);
    if(idx > -1){
      connectorList.splice(idx, 1);
    }
  },
  getConnectors: function(){
    return this.connectors.map(function(conn){return conn.id});
  },
  toJSON: function(){
    return {
      id: this.id,
      nodeIds: this.nodes.map(function(node){return node.id}),
      style: this.el.attr()
    }
  }
};

