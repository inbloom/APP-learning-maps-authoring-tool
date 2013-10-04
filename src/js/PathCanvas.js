function PathCanvas(config, parentEl){
  if(!parentEl){
    throw new Error('Must Specify a Parent Element');
  }
  var self = this;

  var container = this.container = document.createElement('div');
  container.className = "path-window";
  container.id = "path-win";
  parentEl.appendChild(container);

  //set up top bar
  var bar = document.createElement('div');
  bar.className = "path-window-bar";
  container.appendChild(bar);

  // add toolbar to top bar
  this.initToolbar();

  //set up svg div
  var svgDiv = document.createElement('div');
  svgDiv.className = "svg-div";
  container.appendChild(svgDiv);

  var paper = this.el = Raphael(svgDiv, PAPER_WIDTH , PAPER_HEIGHT);

  this.addResizeHandle();

  svgDiv.getElementsByTagName('svg')[0].addEventListener('contextmenu', function(ev){ ev.preventDefault();});


  this.nodeMenu = new TinyContextMenu($('#node-menu'));

  this.nodes = [];
  this.connectors = [];
  this.groups = [];
  this.idMap = {};
  this.customStyle = null;

  if(config){
    if(config.customStyle){
      this.customStyle = config.customStyle;
    }
    if(config.nodes && config.nodes.length){
      config.nodes.forEach(function(node){
        self.addNode(node);
      });
    }
    if(config.groups && config.groups.length){
      config.groups.forEach(function(group){
        self.addGroup(group);
      });
    }
    if(config.connectors && config.connectors.length){
      config.connectors.forEach(function(connector){
        self.addConnector(connector);
      });
    }
  }


  this.popup = $('#node-info')
    .find('.x-button')
    .on('click', function(){
      $('#node-info').hide();
    })
  .end();

}

PathCanvas.prototype = {
  toJSON: function(){
    var obj = {};
    obj.nodes = this.nodes.map(function(node){ return node.toJSON() });
    obj.groups = this.groups.map(function(group){ return group.toJSON()});
    obj.connectors = this.connectors.map(function(connector){ return connector.toJSON() });
    if(this.customStyle){
      obj.customStyle = pathCanvas.customStyle;
    }
    return obj;
  },
  addNode: function(config){
    var node = new LRNode(config, this);
    this.nodes.push(node);
    this.idMap[node.id] = node;
    return node;
  },
  addNodeList: function(nodeList){
    var x = BUFFER, y = BUFFER, spacer = 50, maxX = PAPER_HEIGHT - BUFFER, maxY = PAPER_WIDTH - BUFFER;

    for(var i = 0, len = nodeList.length; i < len; i++){
      var node = nodeList[i];

      node.position = { x: x, y: y };
      this.addNode(node);

      y += spacer;
      if(y > maxY){
        y = BUFFER;
        x += spacer * 3;
      }
    }
  },
  removeNode: function(node){
    var idx = this.nodes.indexOf(node);

    if(idx > -1){
      this.nodes[idx].destroy();
      this.nodes.splice(idx, 1);
    }
  },
  addConnector: function(config){
    var path = new LRConnector(config, this);
    this.connectors.push(path);
    this.idMap[path.id] = path;
  },
  removeConnector: function(connector){
    var idx = this.connectors.indexOf(connector);

    if(idx > -1){
      this.connectors[idx].destroy();
      this.connectors.splice(idx, 1);
    }
  },
  addGroup: function(config){
    var grp = new LRGroup(config, this);
    this.groups.push(grp);
    this.idMap[grp.id] = grp;
    return grp;
  },
  removeGroup: function(group){
    var idx = this.groups.indexOf(group);

    if( idx > -1 ){
      this.groups[idx].destroy();
      this.groups.splice(idx, 1);
    }
  },
  resetCanvas: function(config){
    this.nodes = [];
    this.paths = [];
    this.groups = [];
    this.idMap = {};
    this.customStyle = null;

    this.el.clear();
    this.addResizeHandle();

    var self = this;

    if(config){
      if(config.customStyle){
        this.customStyle = config.customStyle;
      }
      if(config.nodes && config.nodes.length){
        config.nodes.forEach(function(node){
          self.addNode(node);
        });
      }
      if(config.groups && config.groups.length){
        config.groups.forEach(function(group){
          self.addGroup(group);
        });
      }
      if(config.connectors && config.connectors.length){
        config.connectors.forEach(function(connector){
          self.addConnector(connector);
        });
      }
    }
  },
  preparePathJSON: function(){
    var head;
    function processCurrent(node){
      var nodeObj = {};

      if(node instanceof LRNode){
        nodeObj.type = "standard";
        nodeObj.competencyUrn = node.info.id;
        nodeObj.name = node.textValue;
      }
      else if( node instanceof LRGroup){
        nodeObj.type = "group";
        nodeObj.steps = [];
        for(var i = 0, len = node.nodes.length; i < len; i++) {
          nodeObj.steps.push({
            type: "standard",
            competencyUrn: node.nodes[i].info.id,
            name: node.nodes[i].textValue
          });
        }
      }

      return nodeObj;
    }

    function getNext(node){
      for(var i = 0, len = node.connectors.length; i < len; i++) {
        if(node.connectors[i].fromNode === node) {
          return node.connectors[i].toNode;
        }
      }
      return false;
    }

    //find head node/group, and throw error if more than one candidate (means unconnected nodes)
    this.nodes.forEach(function(node){
      if(!node.group && node.connectors.length === 0) {
        throw new Error("Cannot Publish: Path contains unconnected nodes.");
      }
      else if(node.connectors.length === 1 && node.connectors[0].fromNode === node) {
        if(!head){
          head = node;
        }
        else {
          throw new Error("Cannot Publish: Path must be one single continuous path.");
        }
      }
    });

    this.groups.forEach(function(group){
      if(group.connectors.length === 0) {
        throw new Error("Cannot Publish: Path contains unconnected groups.");
      }
      else if(group.connectors.length ===1 && group.connectors[0].fromNode === group) {
        if(!head){
          head = group;
        }
        else {
          throw new Error("Cannot Publish: Path must be one single continuous path.");
        }
      }
    });

    if(!head){
      throw new Error("Cannot Publish: Cannot determine starting point.");
    }

    var pathObj = {steps: []};
    var current = head;

    while(current) {
      pathObj.steps.push(processCurrent(current));
      current = getNext(current);
    }

    return pathObj;


  },
  importPath: function(data){
    var steps = data.steps;
    var thisStep, lastStep;

    this.resetCanvas();

    var x = BUFFER, y = BUFFER, width = pathCanvas.el.width, direction = 1, xSpacer = 300, ySpacer = 150;
    function makeStep(step, grouped) {
      var configObj = {};

      if(step.type === "standard"){
        configObj.text = step.name;
        configObj.info = {
          type: "standard",
          name: step.competencyUrn
        };
        var node = pathCanvas.addNode(configObj);
        node.setPosition({
          x: x,
          y: y
        });

        if(!grouped){
          if(direction > 0 && (x + 100 + xSpacer > width)) {
            y = y + ySpacer;
            direction = -direction;
          }
          else if(direction < 0 && ( x - xSpacer < 0)){
            y = y + ySpacer;
            direction = -direction;
          }
          else {
            x = x + xSpacer * direction;
          }
        }

        return node;
      }

      if(step.type === "group"){
        configObj.nodeIds = [];
        for(var i = 0, len = step.steps.length; i < len; i++) {
          configObj.nodeIds.push(makeStep(step.steps[i], true).id);
        }

        var group = pathCanvas.addGroup(configObj, true);
        group.setPosition({
          x: x,
          y: y
        });


        if(direction > 0 && (x + 100 + xSpacer > width)) {
          y = y + ySpacer;
          direction = -direction;
        }
        else if(direction < 0 && ( x - xSpacer < 0)){
          y = y + ySpacer;
          direction = -direction;
        }
        else {
          x = x + xSpacer * direction;
        }

        return group;
      }

    }

    for(var i = 0, len = steps.length; i < len; i++) {
      thisStep = makeStep(steps[i]);

      if(lastStep) {
        pathCanvas.addConnector({
          to: thisStep.id,
          from: lastStep.id
        });
      }

      lastStep = thisStep;
    }
  },
  addResizeHandle: function(){
    var paper = this.el;
    var self = this;

    var resize = this.resizeHandle = this.el.image('images/resize.png', paper.width-22, paper.height-22, 20,20);
    resize.node.setAttribute('class', 'resize-handle');

    var p_width, p_height;
    resize.drag(function(dx, dy){
      var newx = Math.min(Math.max(p_width + dx, MIN_WIDTH), MAX_WIDTH);
      var newy = Math.min(Math.max(p_height + dy, MIN_HEIGHT), MAX_HEIGHT);
      paper.setSize(newx, newy);
      resize.attr({x: newx - 22, y: newy - 22});
      if(self.background){
        self.background.attr({
          width: newx,
          height: newy
        });
      }
    },
    function(){
      p_width = paper.width;
      p_height = paper.height;
      resize.toFront();
    });
  },
  updateNodeStyle: function(styles){
    this.customStyle = styles;
    this.nodes.forEach(function(node){
      node.updateStyle(styles);
    });
  },
  updateBackground: function(imgUrl){
    var paper = this.el;

    if(this.background) {
      this.background.remove();
    }
    if(imgUrl){
      this.background = paper.image(imgUrl,0,0,paper.width, paper.height);
      this.background.toBack();
    }
  },
  initToolbar: function(){
    var pathCanvas = this;

    //copy and add the toolbar elements
    var bar = $('.path-toolbar', '#path-toolbar-tmpl').clone();
    $(this.container).find('.path-window-bar').append(bar);

    // Set up the toolbar
    var toolbarItems = bar.find('.toolbar-item');
    var moveIcon = bar.find('.select');
    var toolbar = this.toolbar = {};
    var cursorModeChanger = function(type){
      toolbar.cursorMode = type;
    };
    var actions = {
      "move": cursorModeChanger,
      "path": cursorModeChanger,
      "breakpath": cursorModeChanger,
      "new": function(){},
      "open": function(){
        openMenu.show();
        moveIcon.click();
        $(document).one('click', function(){
          openMenu.hide();
        });
      },
      "save": function(){
        saveMenu.show();
        moveIcon.click();
        $(document).one('click', function(){
          saveMenu.hide();
        });
      },
      "print": function(){
        window.print();
        moveIcon.click();
      },
      "style": function(){
        pathStyle.show();
        moveIcon.click();
      },
      "delete": function(){
        var del = confirm("Are you sure you want to delete this path?\n(This cannot be undone)");
        if(del){
          pathCanvas.resetCanvas();
        }
        moveIcon.click();
      },
      "undo": function(){
        //undo here
        moveIcon.click();
      },
      "redo": function(){
        //redo here
        moveIcon.click();
      }
    };
    var itemClickHandler = function(ev){
      ev.stopPropagation();
      var el = $(this);

      // style the ui elements
      toolbarItems.removeClass('toolbar-active');
      el.addClass('toolbar-active');

      var data = el.data('mode');
      if(typeof actions[data] === 'function') actions[data](data);
    };
    toolbarItems.on('click', itemClickHandler);


    //Add file import handler
    $('#path-file').on('change', function(evt){
      var files = evt.target.files; // FileList object

      // Loop through the FileList
      for (var i = 0, f; f = files[i]; i++) {

        var reader = new FileReader();
        // If we use onloadend, we need to check the readyState.
        reader.onload = function(evt) {
          try{
            var pathJSON = JSON.parse(evt.target.result);
            pathCanvas.resetCanvas(pathJSON);
          }
          catch(e){
            alert("Unable to load file");
            console.log(e.stack);
          }
          finally {
            $('#path-file').replaceWith($('#path-file').clone(true));
          }
        }

        reader.readAsText(f);
      }
    });

    var saveMenu = bar.find('.save-path');
    saveMenu.find('li').on('click', function(ev){
      ev.stopPropagation();
      saveMenu.hide();

      if($(this).data('action') === "local") {
        downloadJSON(pathCanvas.toJSON());
      }
      else if($(this).data('action') === "public") {
        var pathData = pathCanvas.preparePathJSON();
        if(pathData){
          var name = prompt('Name your path:\n');
          if(name){
            publishedPaths.publishPath({
              name: name,
              payload: encodeURI(JSON.stringify(pathData))
            });
          }
          else {
            alert('A name is required.');
          }
        }
      }
    });

    var openMenu = bar.find('.open-path');
    openMenu.find('li').on('click', function(ev){
      ev.stopPropagation();
      openMenu.hide();

      if($(this).data('action') === "local") {
        $('#path-file').click();
      }
      else if($(this).data('action') === "public") {
        publishedPaths.showPublishedPaths();
      }
    });

    var publishedPaths = (function(){
      var publicPaths;
      var pathDiv = $('#public-paths');
      var select = $('#published-path-list');

      pathDiv.find("#public-path-ok").on("click", function(){
        var id = select.val();
        getPublicPath(id);
        pathDiv.hide();
      });
      pathDiv.find("#public-path-cancel").on("click", function(){
        pathDiv.hide();
      });

      function showPublishedPaths() {
        pathDiv.show();

        getPublicPaths();
      }

      function getPublicPaths() {
        $.getJSON("getPaths.php", buildPublicPathsView);
      }

      function getPublicPath(id){
        $.getJSON("getFullPath.php?pathId="+id, openPublicPath);
      }

      function openPublicPath(data){
        if(data){
          pathCanvas.importPath(JSON.parse(decodeURIComponent(data.payload)));
        }
      }

      function buildPublicPathsView(data){
        publicPaths = data;
        select.empty();

        if(data.length){
          data.forEach(function(datum){
            select.append('<option value="'+datum.id+'">'+datum.name+'</option>');
          });
        }

      }

      function publishPath(data){
        $.ajax({
          type: 'post',
          processData: false,
          contentType: 'application/json',
          url: 'publishPath.php',
          data: JSON.stringify(data),
          success: function(){
            alert('Path Saved!');
          },
          error: function(){
            alert('Path could not be saved. Please try again.');
          }
        });
      }

      return {
        showPublishedPaths: showPublishedPaths,
        publishPath: publishPath
      }
    })();
  }
};

