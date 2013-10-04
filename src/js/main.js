/*
 * define some constants
 */

var RND_CORNER = 10;
var NODE_WIDTH = 100;
var NODE_HEIGHT = 30;
var PAPER_WIDTH = 800;
var PAPER_HEIGHT = 500;
var MIN_WIDTH = 200;
var MIN_HEIGHT = 200;
var MAX_WIDTH = 1500;
var MAX_HEIGHT = 1000;
var BUFFER = 15;
var NODE_BG = "#d0ecf5";
var STROKE = "#d0ecf5";
var TEXT_FILL = "black";

function getDefaultStyle(){
  return {
    fill: NODE_BG,
    stroke: STROKE,
    x: BUFFER,
    y: BUFFER,
    width: NODE_WIDTH,
    height: NODE_HEIGHT
  };
};

function rndId(){
  if(!this.ids) this.ids = {};

  var candidate = Math.floor(Math.random() * 10000);

  while(this.ids[candidate]){
    candidate = Math.floor(Math.random() * 10000);
  }

  this.ids[candidate] = true;

  return candidate;
};

function isCircular(checkNode, startingNode){
  if(!checkNode || !startingNode){
    throw new Error("Requires both to and from nodes to operate");
  }

  if(startingNode === checkNode){
    //circular at some depth
    return true;
  }

  if(!startingNode.connectors.length){
    // end of the line!
    return false;
  }

  for(var i = 0, len = startingNode.connectors.length; i < len; i++){
    var conn = startingNode.connectors[i];
    if(conn.fromNode === startingNode){
      return isCircular(checkNode, conn.toNode);
    }
  }
}

$(function(){
  //TODO REMOVE THIS ---- the following is just for debugging purposes

  $(window).on('keydown', function(ev){
    if(ev.keyCode === 116 && ev.altKey){
      ev.preventDefault();
      window.location.href = 'http://localhost/inBloom4/';
    }
  });

  window.pathCanvas = new PathCanvas({}, $('#path-outer-container')[0]);
  pathStyle.init();
});
