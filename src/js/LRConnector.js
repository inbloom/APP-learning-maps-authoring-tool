ARROW_STROKE = "#444"
ARROW_FILL = "#444";
ARROW_WIDTH = 3;

function LRConnector(config, parentCanvas){
  this.fromNode = parentCanvas.idMap[config.from] || null;
  this.toNode = parentCanvas.idMap[config.to] || null;
  this.fromNode._addConnector(this);
  this.toNode._addConnector(this);
  this.id = rndId();
  this.parentCanvas = parentCanvas;
  this.paper = parentCanvas.el

  this.init();
  //this.el.toBack();
};

LRConnector.prototype = {
  init: function(){
    var self = this;

    var anchorPoints = this.getAnchorNodes();
    var el = this.el = this.paper.path(this.getPath());
    el.attr('stroke-width', ARROW_WIDTH); 
    el.attr('stroke', ARROW_STROKE);

    this.el.hover(function(){
      if(self.parentCanvas.toolbar.cursorMode === "breakpath"){
        this.attr('stroke-width', ARROW_WIDTH + 3);
      }
    }, function(){
      if(self.parentCanvas.toolbar.cursorMode === "breakpath"){
        this.attr('stroke-width', ARROW_WIDTH);
      }
    });
    this.el.click(function(){
      if(this.parentCanvas.toolbar.cursorMode === "breakpath"){
        this.parentCanvas.removeConnector(this);
      }
    }, this);
    this.drawArrowhead();
  },
  destroy: function() {
    // get rid of references to this connector
    this.fromNode._removeConnector(this);
    this.toNode._removeConnector(this);

    //remove the element itself
    this.el.remove();
    this.arrowhead.remove();
  },
  update: function(){
    this.getAnchorNodes();
    this.el = this.el.attr("path", this.getPath());
    this.updateArrowhead();
  },
  updateArrowhead: function(){
    var path = this.getArrowheadPath();
    this.arrowhead.attr('path', path);
  },
  drawArrowhead: function(){
    var path = this.getArrowheadPath();
    this.arrowhead = this.parentCanvas.el.path(path);
    this.arrowhead.attr('fill', ARROW_FILL);
    this.arrowhead.attr('stroke', ARROW_STROKE);
  },
  getArrowheadPath: function(){
    var anchorPoints = this.anchorPoints;

    var pointx = anchorPoints.to.x;
    var pointy = anchorPoints.to.y;

    var path = "M";
    path += pointx;
    path += ",";
    path += pointy;
    path += "L";
    path += pointx - 10;
    path += ",";
    path += pointy - 5;
    path += ",";
    path += pointx - 10;
    path += ",";
    path += pointy + 5;
    path += "z";
    
    var angle = "r"+(Raphael.angle(anchorPoints.from.x, anchorPoints.from.y, anchorPoints.to.x, anchorPoints.to.y) - 180)+","+pointx+","+pointy;
    path = Raphael.transformPath(path, angle);

    return path;
  },
  getAnchorNodes: function(){
    var anchor = {};

    var from = this.fromNode.el;
    var to = this.toNode.el;

    var fromx = from.attr('x');
    var fromy = from.attr('y');
    var fromWidth = from.attr('width');
    var fromHeight = from.attr('height');

    var tox = to.attr('x');
    var toy = to.attr('y');
    var toWidth = to.attr('width');
    var toHeight = to.attr('height');

    var midfromx = fromx + fromWidth/2;
    var midfromy = fromy + fromHeight/2;

    var midtox = tox + toWidth/2;
    var midtoy = toy + toHeight/2;

    var angle = anchor.angle = Raphael.angle(midfromx, midfromy, midtox, midtoy);
    
    if(angle < 45 || angle >= 320){
      // right to left
      anchor.from = {
        x: fromx,
        y: fromy + fromHeight/2,
      };
      anchor.to = {
        x: tox + toWidth,
        y: toy + toHeight/2,
      };
    }
    else if(angle >= 45 && angle < 135){
      //bottom to top
      anchor.from = {
        x: fromx + fromWidth/2,
        y: fromy,
      };
      anchor.to = {
        x: tox + toWidth/2,
        y: toy + toHeight,
      };
    }
    else if(angle >= 135 && angle < 215){
      //left to right
      anchor.from = {
        x: fromx + fromWidth,
        y: fromy + fromHeight/2,
      };
      anchor.to = {
        x: tox,
        y: toy + toHeight/2,
      };
    }
    else if(angle >= 215 && angle < 320){
      //top to bottom
      anchor.from = {
        x: fromx + fromWidth/2,
        y: fromy + fromHeight,
      };
      anchor.to = {
        x: tox + toWidth/2,
        y: toy,
      };
    }

    this.anchorPoints = anchor;
  },
  getPath: function(){
    var anchorPoints = this.anchorPoints;

    var from = this.fromNode.el;
    var to = this.toNode.el;
    
    var fromx = this.fromx = anchorPoints.from.x;
    var fromy = this.fromy = anchorPoints.from.y;

    var tox = this.tox = anchorPoints.to.x;
    var toy = this.toy = anchorPoints.to.y;

    var distFromNode = -10;
    var angle = Raphael.rad(Raphael.angle(fromx, fromy, tox, toy));
    
    var dx = Math.cos(angle) * distFromNode;
    var dy = Math.sin(angle) * distFromNode;

    var tox = tox - dx;
    var toy = toy - dy;

    var path = "M";
    path += fromx;
    path += ",";
    path += fromy;
    path += "L";
    path += tox;
    path += ",";
    path += toy;
    return path;
  },
  toJSON: function(){
    var obj = {};
    obj.from = this.fromNode.id;
    obj.to = this.toNode.id;
    return obj;
  }
};
