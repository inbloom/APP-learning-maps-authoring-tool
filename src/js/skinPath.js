(function(){

  var el, sampleNode, nodeColor, textColor, bgInput;
  var changed = false;

  function init(){
    el = $('#skin-mode');
    sampleNode = $('#sample-node');
    nodeColor = $('#choose-node-color');
    textColor = $('#node-text-color');
    bgInput = $('#background-upload');

    function updateNodeColor(color){
      sampleNode.css('background', color.toHexString());
    }

    function updateTextColor(color){
      sampleNode.css('color', color.toHexString());
    }

    nodeColor.spectrum({
      color: '#d0ecf5',
      change: updateNodeColor
    });

    textColor.spectrum({
      color: 'black',
      change: updateTextColor
    });

    //Add file import handler
    bgInput.on('change', function(){
      changed = true;
    });


  }
  function setCustomStyles(){
    setPathBackground();
    
    //Set the custom node styles
    var color = nodeColor.spectrum('get').toHexString();
    var text = textColor.spectrum('get').toHexString();

    pathCanvas.updateNodeStyle({
      nodeColor: color,
      textColor: text
    });

    //Hide the custom style element
    hide();
  }

  $('#skin-ok').on('click', setCustomStyles);

  $('#skin-cancel').on('click', hide);

  function show(){
    el.show();
  }

  function hide(){
    el.hide();
  }

  function setPathBackground(){
    var imgSrc, newInput;

    if(changed) {
      if(bgInput[0].files.length){
        imgSrc = window.URL.createObjectURL(bgInput[0].files[0]);
      }
      pathCanvas.updateBackground(imgSrc);
      changed = false;
    }
  }

  window.pathStyle = {
    init: init,
    show: show,
    hide: hide
  };
})();
