/**
 *
 *
 */

function LRNode(config, parentCanvas){
  config = config || {};
  this.id = config.id || rndId();
  this.textValue = config.text || this.id;
  this.connectors = [];
  this.style = config.style || getDefaultStyle();
  this.info = config.info;

  if(config.position){
    this.style.x = config.position.x;
    this.style.y = config.position.y;
  }
  this.connectors = [];
  this.parentCanvas = parentCanvas;
  this.paper = parentCanvas.el;
  this.xbuffer = BUFFER;
  this.ybufferTop = BUFFER;
  this.ybufferBottom = BUFFER;

  this.registerEvent('delete', function(){
    this.parentCanvas.removeNode(this);
  }.bind(this));

  this.registerEvent('rename', this.renameNode.bind(this));

  this.registerEvent('ungroup', this.ungroupNode.bind(this));

  this.registerEvent('info', this.showInfo.bind(this));

  this.init();
};

LRNode.prototype = {
  init: function(){
    var self = this;
    //make element
    var el = this.el = this.paper.rect(this.style.x, this.style.y, this.style.width, this.style.height, RND_CORNER);
    el.attr(this.style);

    var text = this.text = this.paper.text( this.style.x + this.style.width/2, this.style.y + this.style.height/2, this.textValue);
    text.attr('fill', 'black');
    text.toFront();

    if(this.parentCanvas.customStyle){
      this.style.fill = this.parentCanvas.customStyle.nodeColor;
      this.updateStyle(this.parentCanvas.customStyle);
    }

    var txtLen = text.node.getComputedTextLength();
    if( txtLen > this.style.width){
      this.style.width = txtLen + BUFFER;
      el.attr("width", this.style.width);
      text.attr({x:this.style.x + this.style.width/2, y: this.style.y + this.style.height/2});
    }

    // Add hover event listeners
    
    el.mouseover(function(){
      if(self.parentCanvas.toolbar.cursorMode === "move"){
        el.attr('stroke-width', 2);
        el.attr('stroke', '#666');
      }
    });
    el.mouseout(function(){
      if(self.parentCanvas.toolbar.cursorMode === "move"){
        el.attr('stroke-width', 1);
        el.attr('stroke', el.attr('fill'));
      }
    });
    
    // Add hover event listeners
    text.mouseover(function(){
      if(self.parentCanvas.toolbar.cursorMode === "move"){
        el.attr('stroke-width', 2);
        el.attr('stroke', '#666');
      }
    });
    text.mouseout(function(){
      if(self.parentCanvas.toolbar.cursorMode === "move"){
        el.attr('stroke-width', 1);
        el.attr('stroke', el.attr('fill'));
      }
    });

    //test context
    el.mouseup(function(ev){
      if(ev.which === 3){
        console.log('id', this.id);
        this.parentCanvas.nodeMenu.showMenu(ev, {target: this, cssClass: this.group ? 'group' : null});
      }
    },this);
    text.mouseup(function(ev){
      if(ev.which === 3){
        console.log('id', this.id);
        this.parentCanvas.nodeMenu.showMenu(ev, {target: this, cssClass: this.group ? 'group' : null});
      }
    }, this);

    // Add drag event listener
    this.addDragListeners();

    // Add click handlers
    el.click(this.clickHandlers, this);
    text.click(this.clickHandlers, this);
  },
  destroy: function() {
    // Destroy all connectors
    var conn = this.connectors;
    while(conn.length){
      conn[0].destroy();
    }

    if(this.group){
      this.group.removeFromGroup(this);
    }

    //remove the element
    this.el.remove();
    this.text.remove();
    this.tempPath && this.tempPath.remove();
  },
  addDragListeners: function(){
    this.el.drag(this.onDrag.bind(this), this.onDragStart.bind(this), this.onDragStop.bind(this));
    this.text.drag(this.onDrag.bind(this), this.onDragStart.bind(this), this.onDragStop.bind(this));
  },
  onDrag: function(dx, dy){
    if(this.parentCanvas.toolbar.cursorMode === "move"){
      var newCoords = this.getNewCoordinates(this.tempx, this.tempy, dx, dy);

      //reset temporary groups
      if(this.tempPath){
        this.tempPath.remove();
        this.tempPath = null;
      }
      if(this.tempGroup){
        this.tempGroup.removeFromGroup(this);
        this.tempGroup = null;
      }

      //  collision detection testing
      var collStatus = this.collStatus = this.checkCollision(newCoords);
      if(collStatus.colliding && !this.group){
        if(collStatus.collidingWith instanceof LRNode){
          newCoords.x = collStatus.collidingWith.el.attr('x');
          newCoords.y = collStatus.collidingWith.el.attr('y') + this.style.height + 10;

          this.tempPath = this.makeGroupRect();
        }
        else if(collStatus.collidingWith instanceof LRGroup){
          //temporarily adjust group to include LRNode
          this.tempGroup = collStatus.collidingWith;
          this.tempGroup.addToGroup(this);
        }
      }

      !this.tempGroup && this.setPosition(newCoords);

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
      this.text.toFront();
    }
  },
  onDragStop: function(){
    var group, otherNode, collStatus = this.collStatus;

    if(collStatus && collStatus.colliding){
      otherNode = collStatus.collidingWith

      if(!this.group && otherNode instanceof LRNode){
        group = this.parentCanvas.addGroup({
          nodes: [otherNode, this],
          rect: this.tempPath
        });
        
        otherNode.addToGroup(group);
        this.addToGroup(group);

      }
      else if(otherNode instanceof LRGroup){
        this.addToGroup(otherNode);
        this.tempGroup = null;
      }
    }
  },
  setPosition: function(newCoords){
      this.el.attr(newCoords);
      this.text.attr({x:newCoords.x + this.style.width/2, y: newCoords.y + this.style.height/2});
      this.el.toFront();
      this.text.toFront();
  },
  addToGroup: function(group){
    if(!this.group){
      this.group = group;
      this.fixGroupBuffers();
      this.el.undrag();
      this.text.undrag();
      this.tempPath = null;
      var parentCanvas = this.parentCanvas;
      this.connectors.forEach(function(conn){
        parentCanvas.removeConnector(conn);   
      });
    }
  },
  fixGroupBuffers: function(){
    var elAttrs, groupAttrs;

    if(this.group){
      elAttrs = this.el.attr();
      groupAttrs = this.group.el.attr();

      this.xbuffer = BUFFER + (elAttrs.x - groupAttrs.x);
      this.ybufferTop = BUFFER + (elAttrs.y - groupAttrs.y);
      this.ybufferBottom = BUFFER + (groupAttrs.height - (elAttrs.y - groupAttrs.y) - elAttrs.height);
    }
  },
  clickHandlers: function(ev){
    if(this.parentCanvas.toolbar.cursorMode === "path"){
      if(this.group){
        this.group.pathConnector();
      }
      else{
        this.pathConnector();
      }
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
  getNewCoordinates: function(oldx, oldy, dx, dy){
    var paperWidth = this.paper.width;
    var paperHeight = this.paper.height;
    var nodeWidth = this.el.attr('width');
    var nodeHeight = this.el.attr('height');
    var xbuffer = this.xbuffer;
    var ybufferTop = this.ybufferTop;
    var ybufferBottom = this.ybufferBottom;

    var x = Math.min(Math.max(oldx + dx, xbuffer), paperWidth - nodeWidth - xbuffer);
    var y = Math.min(Math.max(oldy + dy, ybufferTop), paperHeight - nodeHeight - ybufferBottom);

      return { x: x, y: y};
  },
  makeGroupRect: function(){
    var otherNode = this.collStatus.collidingWith;
    startX = otherNode.el.attr('x') - 10;
    startY = otherNode.el.attr('y') - 10;
    width = otherNode.el.attr('width') + 20;
    height = otherNode.el.attr('height') * 2 + 30;

    return this.paper.rect(startX, startY, width, height, 8);
  },
  checkCollision: function(coords){
    var thisXCenter = coords.x + this.style.width/2;
    var thisYCenter = coords.y + this.style.height/2;
    var nodes = this.parentCanvas.nodes;
    var i = 0;
    var length = nodes.length;
    var touching = false;
    var colliding = false;

    for(;i < length; i++){
      var n = nodes[i];
      if(n === this) continue;

      var nX = n.el.attr('x') + n.style.width/2;
      var nY = n.el.attr('y') + n.style.height/2;

      var leftBoxCenterX = Math.max(thisXCenter, nX);
      var leftBoxCenterY = Math.max(thisYCenter, nY);

      var rightBoxCenterX = Math.min(thisXCenter, nX);
      var rightBoxCenterY = Math.min(thisYCenter, nY);

      //var nY = n.el.attr('y');

      var distX = leftBoxCenterX - rightBoxCenterX;
      var distY = leftBoxCenterY - rightBoxCenterY;

      var closeGapX = distX - this.style.width - BUFFER*2;
      var closeGapY = distY - this.style.height - BUFFER*2;

      var gapX = distX - this.style.width;
      var gapY = distY - this.style.height;

      if(gapX > 0 && gapY > 0){
        continue;
      }
      if(gapX < 0 && gapY < 0) {
        colliding = true;
        break;
      }
    }

    return {
      colliding: colliding,
      collidingWith: (n.group ? n.group : n)
    };
  
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
      text: this.textValue,
      info: this.info,
      style: this.el.attr()
    };
  },
  select: function(){
    this.el.attr('fill', '#067BBE');
  },
  unselect: function(){
    this.el.attr('fill', this.style.fill);
  },
  renameNode: function(){
    var newName = prompt("Enter a new name:");

    this.text.attr('text', newName);
    this.textValue = newName;
  },
  ungroupNode: function(ev, silent){
    if(!silent){
      this.group.removeFromGroup(this);
    }
    this.group = null;

    this.addDragListeners();

    this.xbuffer = BUFFER;
    this.ybufferTop = BUFFER;
    this.ybufferBottom = BUFFER;

    this.el.toFront();
    this.text.toFront();
  },
  showInfo: function(ev){
    this.parentCanvas.popup
      .find('.node-info-title')
         .text(this.info.name)
         .end()
      .find('.node-info-desc')
        .text(this.info.desc)
        .end()
      .css({
        left: ev.pageX,
        top: ev.pageY,
        display: 'block'
      })
      .show()
  },
  updateStyle: function(style){
    if(style.nodeColor){
      this.el.attr('fill', style.nodeColor);
      this.el.attr('stroke', style.nodeColor);
      this.style.fill = style.nodeColor;
    }

    if(style.textColor) {
      this.text.attr('fill', style.textColor);
    }
  },
  fireEvent: function(evStr, data){
    if(this._registeredEvents[evStr]){
      return this._registeredEvents[evStr](data);
    }
    else {
      console.log('No known behavior for:',evStr);
    }
  },
  registerEvent: function(evStr, handler){
    if(!this._registeredEvents) this._registeredEvents = {};

    this._registeredEvents[evStr] = handler;
  }
};
