/* This file creates checkboxed heirarchical trees of standards
*/

// First create the empty JSONs for personal and Common Core and the grades array
// and other assorted global variables
var personalJSON = [];
var commonCoreJSON = {};
var gradeLevels = [];
var personalID = 1;
var publicCount = 0;
var standardID = 0;
var newPersonal = 0;
var resources = {};
var publishing = 0;

// This function adds a new framework if it doesn't already exist
// And adds a new standard to the framework if it does exist
function addStandard() {
  if(!newPersonal) {
    personalJSON[personalID] = { "NewFramework": { "type" : "framework special", "name": "New Framework"}};
    loadPersonal();
    newPersonal = personalID;
    personalID++;
  } else {
    $('#personal' + newPersonal).tree('addNode', 
        {"li": {"class": "level1 standard leaf", "lriid": "test_lriid", "id": "newStandard" + standardID},
         "span": { html: "new standard"}
        }, $('#NewFramework'));
    $('#personal' + newPersonal).find('.daredevel-tree-label').removeClass('label').addClass('label').attr('title','new standard');
    $('#newStandard' + standardID).children('input').val("new standard");
    $('#newStandard' + standardID).append('<div class="standardButtons"> \
                                            <div title="Info" class="info pointer" onclick="toggleInfo(this);"></div> \
                                           </div> \
                                           <div class="infoBox"> \
                                             <div class="highlighter"></div> \
                                             <div class="infoBoxButtons"><button onclick="editStandard(this);">edit</button></div> \
                                             <div class="infoName">new standard</div> \
                                             <div class="infoType">standard</div> \
                                             <div class="infoDesc"></div> \
                                           </div>');
    standardID++;
    $('.label').click(function() {
      $('#personal' + newPersonal).tree('expand', $(this).parent());
    });
    $('.label').click(function() {
      $('#personal' + newPersonal).tree('collapse', $(this).parent());
    });
    $('#personal' + newPersonal).bind('treeexpand', function() {
      abbreviateChildren($(this).children('ul'));
    });
  }
}

// This code copies Common Core standards into a flat list in the Personal set
function copyCCStandards(obj) {
  var checkedStandards;
  var checkedComponents;
  for(var grade in gradeLevels) {
    var foo = $(obj).parent('div').children('div').children('ul').find('.grade.' + gradeLevels[grade] + 'grade').find('li.' + subject).find('input:checked.standard');
    var bar = $(obj).parent('div').children('div').children('ul').find('.grade.' + gradeLevels[grade] + 'grade').find('li.' + subject).find('input:checked.component');
    checkedStandards = $(checkedStandards).add(foo);
    checkedComponents = $(checkedComponents).add(bar);
  }
  checkedStandards = $(checkedStandards).toArray();
  checkedComponents = $(checkedComponents).toArray();
  var checkedItems = checkedStandards.concat(checkedComponents);
  var copyJSON = {};
  for(var standard in checkedItems) {
    var fullPath = checkedItems[standard].value.split('.');
    if(checkedItems[standard].value.split('.').slice(-1)[0].match(/[a-z]/)) {
      fullPath.push(fullPath[fullPath.length - 1].slice(-1));
      fullPath[fullPath.length - 2] = fullPath[fullPath.length - 2].slice(0,-1);
    }
    copyJSON = stringToJSON(fullPath, copyJSON, commonCoreJSON);
  }
  personalJSON[personalID] = copyJSON;
  loadPersonal();
  personalID++;
}

// This function duplicates checked standards from the public section into the personal section
function copyPublicStandards(obj) {
  var checkedStandards = $(obj).parent('div').children('div').children('ul').find('input:checked');
  checkedItems = $(checkedStandards).toArray();
  var copyJSON = {};
  for(var standard in checkedItems) {
    var stdParents = $(checkedItems[standard]).parentsUntil('div','li');
    copyJSON = pubToJSON($(stdParents).toArray(), copyJSON, "framework");
  }
  personalJSON[personalID] = copyJSON;
  loadPersonal();
  personalID++;
}

// This recursive function facilitates the duplication of public standards
function pubToJSON(stdParents, theJSON, type) {
  var topLevelStd = stdParents.pop();
  var topLevelID = $(topLevelStd).attr("lriid");
  if(!theJSON.hasOwnProperty(topLevelID)) {
    theJSON[topLevelID] = {"type": type, "name": $(topLevelStd).children("input").val()};
    var desc = $(topLevelStd).children('.infoBox').children('.infoDesc').text();
    if(desc != 'undefined') {
      theJSON[topLevelID]["desc"] = desc; 
    }
  }
  if(stdParents.length > 0) {
    if(!theJSON[topLevelID].hasOwnProperty('contains')) {
      theJSON[topLevelID]['contains'] = {};
    }
    theJSON[topLevelID]['contains'] = pubToJSON(stdParents,theJSON[topLevelID]['contains'], "standard");
  }
  return theJSON;
}

// This recursive function facilitates the duplication of Common Core Standards
function stringToJSON(thePath, theJSON, commonCore) {
  if(!theJSON.hasOwnProperty(thePath[0])) {
    theJSON[thePath[0]] = JSON.parse(JSON.stringify(commonCore[thePath[0]]));
    if(theJSON[thePath[0]].hasOwnProperty('contains')) {
      theJSON[thePath[0]]['contains'] = {};
    }
    if(!theJSON[thePath[0]].hasOwnProperty('name')) {
      theJSON[thePath[0]]['name'] = thePath[0];
    }
    if(theJSON[thePath[0]].hasOwnProperty('ccss_id')) {
      theJSON[thePath[0]]['name'] = theJSON[thePath[0]]['ccss_id'];
    } else if(theJSON[thePath[0]]['name'].match(/./)) {
      theJSON[thePath[0]]['name'] = theJSON[thePath[0]]['name'].split(' ').slice(-1);
    }
    if(thePath[0] === 'CCSS') { theJSON[thePath[0]]['name'] = 'CCSS'; }
  }
  if(thePath.length > 1) {
    theJSON[thePath[0]]['contains'] = stringToJSON(thePath.slice(1),theJSON[thePath[0]]['contains'],JSON.parse(JSON.stringify(commonCore[thePath[0]]['contains'])));
  }
  return theJSON;
}


// This simply changes the size of the textbox for the standard description so the text fits
function ResizeTextarea(e) {

  // find content length and box width
  var vlen = e.value.length, ewidth = e.offsetWidth;
  if (vlen != e.valLength || ewidth != e.boxWidth) {
    e.style.height = "0px";
    e.style.height = e.scrollHeight + "px";
    e.valLength = vlen;
    e.boxWidth = ewidth;
  }
};

// This function allows the user to edit standards within the personal set
function editStandard(obj) {
  infoBoxButtons = $(obj).parent();
  infoBox = $(infoBoxButtons).parent();
  descBox = $(infoBox).children('.infoDesc');
  typeDrop = {'framework': '<option value="framework">framework</option>',
              'set': '<option value="set">set</option>',
              'grade': '<option value="grade">grade</option>',
              'domain': '<option value="domain">domain</option>',
              'cluster': '<option value="cluster">cluster</option>',
              'standard': '<option value="standard">standard</option>',
              'component': '<option value="component">component</option>'};

  name = $(infoBox).children('.infoName').text();
  type = $(infoBox).children('.infoType').text();

  newInfo = "<div class='highlighter'></div>";
  newInfo += "<div class='infoBoxButtons'><button onclick='saveStandard(this);'>save</button></div>";
  newInfo += "<input class='infoNameEdit' type='text' value='" + name + "'>";
  newInfo += "<select name='type' class='infoType'>";
  for(thisType in typeDrop) {
    if(thisType === type) {
      newInfo += typeDrop[thisType].slice(0,8) + "selected " + typeDrop[thisType].slice(8);
    } else {
      newInfo += typeDrop[thisType];
    }
  }
  newInfo += "</select>";

  desc = $(descBox).text();
  newInfo += "<textarea class='infoDescEdit'>" + desc + "</textarea>";

  $(infoBox).html(newInfo);

  descText = $(infoBox).children('.infoDescEdit').get(0);
  $(descText).on('keypress',function() {
    ResizeTextarea(descText);
  });
  ResizeTextarea(descText);
}

// This function allows the user to keep the edits made to a standard in the personal set
function saveStandard(obj) {
  infoBoxButtons = $(obj).parent();
  infoBox = $(infoBoxButtons).parent();
  desc = $(infoBox).children('.infoDescEdit').get(0);
  if(typeof desc != 'undefined') {
    desc = desc.value;
    descHTML = "<div class='infoDesc'>" + desc + "</div>";
  } else {
    desc = "";
    descHTML = "";
  }
  name = $(infoBox).children('.infoNameEdit').val();
  type = $(infoBox).children('.infoType').val();
  listItem = $(infoBox).parent();
  $(listItem).children('.label').text(name);
  $(listItem).removeClass('framework').removeClass('set').removeClass('grade').removeClass('domain').removeClass('cluster').removeClass('standard').removeClass('component').addClass(type);
  newInfo = "<div class='highlighter'></div>";
  newInfo += "<div class='infoBoxButtons'><button onclick='editStandard(this);'>edit</button></div>";
  newInfo += "<div class='infoName'>" + name + "</div>";
  newInfo += "<div class='infoType'>" + type + "</div>";
  newInfo += descHTML;
  $(infoBox).html(newInfo);
  $(infoBox).siblings('input').val(name);
  abbreviate($(infoBox).parent('li').children('.label'));

}


// This code deletes standards from the list in the Personal set
function deleteStandards() {
  var checkedStandards = $('#personalWrapper').find('input:checked').not('.special').toArray();
  for(var standard in checkedStandards) {
    var node = $(checkedStandards[standard]).parent();
    $(node).remove();
  }
}

// A function to call the recursive load function
function recursiveLoadCC() {
  $('#commonCore').html("<ul id='commonCoreTree'></ul>");
  $.getJSON('./data/ccss.json', function(data) {
    commonCoreJSON = data;
    $('ul#commonCoreTree').append(recursiveDataLoad(commonCoreJSON['CCSS']['contains'], 0, false));
    $('#commonCore').tree({
      onCheck: {
        ancestors: 'checkIfFull',
        descendants: 'check'
      },
      onUncheck: {
        ancestors: 'uncheck'
      },
      collapseDuration:100,
      expandDuration:100,
    }); 
    $('.label').click(function() {
      $('#commonCore').tree('expand', $(this).parent());
    });
    $('.label').click(function() {
      $('#commonCore').tree('collapse', $(this).parent());
    });
    $('#commonCore').bind('treeexpand', function() {
      abbreviateChildren($(this).children('ul'));
    });
    $('#commonCoreTree').find('li').hide();
  });
}

// The recursive data load creates the jQuery tree from the JSON
function recursiveDataLoad(data, level, personal) {
  var element = "", html = "", name, nameHTML, currentSubject = "", type, editText = "<button onclick='editStandard(this);'>edit</button>";
  for(element in data) {
    var elementData = data[element], desc = "", min, max, gradeRange = "", contains = "", collapsed = "", entry = "", levelClass = "", checkboxValue = "";
    if((elementData["type"] === "set" || elementData["type"] === "framework" || elementData["type"] === "initiative") && typeof elementData["ccss_id"] != 'undefined' && !personal) {
      html += recursiveDataLoad(elementData["contains"], level, personal);
    } else {
      if(typeof elementData["ccss_id"] != 'undefined' && !personal) {
        name = elementData["ccss_id"].replace(/CCSS.([A-Za-z\-]*)./,"");
        nameHTML = "<div class='label default' title='" + name + "'>" + name + "</div>";
        currentSubject = elementData["ccss_id"].match(/CCSS.([A-Za-z\-]*)./)[1] + " ";
        checkboxValue = elementData["ccss_id"];
      } else {
        name = elementData["name"];
        if(elementData["type"] === "framework" || elementData["type"] === "initiative" || !personal) {
          nameHTML = "<div class='label default' title='" + name + "'>" + elementData["name"] + "</div>";
        } else {
          nameHTML = "<span class='label pointer' title='" + name + "'>" + elementData["name"] + "</span>";
        }
        checkboxValue = name;
      }
      type = elementData["type"];
      levelClass = "level" + level + " ";
      if(personal) {
        var pubDown = "", descDiv = "";
        if(type === "framework" || type === "framework special") {
          desc = "<div class='privateStandardButtons'><div title='Publish Standard' class='publish' onClick='publishJSON(this);'></div><div title='Download Standard' class='download' onClick='download(this);'></div><div title='Info' class='info pointer' onClick='toggleInfo(this);'></div></div><div class='infoBox'>";
        } else {
          desc = "<div class='standardButtons'><div title='Info' class='info pointer' onClick='toggleInfo(this);'></div></div><div class='infoBox'>";
        }
        if(typeof elementData["desc"] != 'undefined') {
          descDiv = "<div class='infoDesc'>" + elementData["desc"] + "</div>";
        }

        desc += "<div class='highlighter'></div>";
        desc += "<div class='infoBoxButtons'>" + editText + "</div>";
        desc += "<div class='infoName'>" + name + "</div>";
        desc += "<div class='infoType'>" + type + "</div>";
        desc += descDiv + "</div>";
      } else {
        if(typeof elementData["desc"] != 'undefined') {
          var resourceLink = '';
          var resourceBox = '';
          if(typeof elementData["ccss_id"] != 'undefined') {
            resourceLink = '<button onClick="toggleResourceBox(this);">resources</button>';
            resourceBox = '<div class="resourceBox"><div class="resourceHead">Resources</div><hr/></div>';
          }
          desc = "<div class='standardButtons'><div title='Info' class='info pointer' onClick='toggleInfo(this);'></div></div><div class='infoBox'>";
          desc += "<div class='highlighter'></div>";
          desc += "<div class='infoBoxButtons'>" + resourceLink + "</div>" + resourceBox;
          desc += "<div class='infoName'>" + name + "</div>";
          desc += "<div class='infoType'>" + type + "</div>";
          desc += "<div class='infoDesc'>" + elementData["desc"] + "</div></div>";
        }
      }
      if(typeof elementData["min"] != 'undefined' && typeof elementData["max"] != 'undefined') {
        min = elementData["min"];
        max = elementData["max"];
        for(var i = min; i <= max; i++) {
          gradeRange += i + "grade ";
        }
      }
      if(typeof elementData["contains"] != 'undefined') {
        contains = "<ul class='tree' id='" + element + "'>" + recursiveDataLoad(elementData["contains"], level + 1,personal) + "</ul>";
        collapsed = " collapsed";
      }

      entry += "<li lriID='" + elementData['lri_id'] + "' class='" + currentSubject + levelClass + gradeRange + type + collapsed + "' id='" + element + "'>";
      entry +=  "<input type='checkbox' class='" + type + "' value='" + checkboxValue + "'/>";
      entry +=  nameHTML;
      entry +=  desc;
      entry +=  contains;
      entry += "</li>";

      if(type === "grade" && element === "K") {
        html = entry + html;
      } else {
        html += entry;
      }
    }
  }
  return html;
}

// This loads the personal standards from a local file (deprecated) and creates the Personal set tree
function loadPersonal() {
  var gradeLevels = [];
  $('.gradeButton.selected').each(function(){
    gradeLevels.push($(this).attr('id'));
  });

  $('#personalWrapper').append('<div id="personal' + personalID + '"><ul id="personalTree' + personalID + '"></ul></div>');
  $('#personalTree' + personalID).append(recursiveDataLoad(personalJSON[personalID],0,true));

  $('#personal' + personalID).tree({
    onCheck: {
      ancestors: 'checkIfFull',
      descendants: 'check'
    },  
    onUncheck: {
      ancestors: 'uncheck'
    },   
    collapseDuration:100,
    expandDuration:100,
  }); 
  $('.label').click(function() {
    personalTree = $(this).parentsUntil('#personalWrapper','div');
    $(personalTree).tree('expand', $(this).parent());
  });
  $('.label').click(function() {
    personalTree = $(this).parentsUntil('#personalWrapper','div');
    $(personalTree).tree('collapse', $(this).parent());
  });
  $('div#personal' + personalID).bind('treeexpand', function() {
    abbreviateChildren($(this).children('ul'));
  });
}

// This function reads an "uploaded" file of standards into the personal set
function readStandardsJSON(evt) {
  var files = evt.target.files; // FileList object

  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; f = files[i]; i++) {

    var reader = new FileReader();
        // If we use onloadend, we need to check the readyState.
    reader.onload = function(evt) {
      personalJSON[personalID] = JSON.parse(evt.target.result);
      loadPersonal();
      personalID++;
    }

    reader.readAsText(f);
  }
}

// This function downloads a set of standards
function download(obj) {
  var framework = $(obj).parent().parent();
  var downloaded = {};
  downloaded[$(framework).children('.label').attr('title')] = recursiveParseJSON(framework,'u','u');
  downloadJSON(downloaded);
}

// This recursive function facilitates the downloading of standards
function recursiveParseJSON(obj, min, max) {
  var JSON = {};
  JSON['name'] = $(obj).children('.label').attr('title');
  JSON['lri_id'] = $(obj).attr('lriid');
  JSON['type'] = $(obj).children('input').attr('class');
  JSON['desc'] = $(obj).children('.infoBox').children('.infoDesc').text();
  if(JSON['type'] === 'grade') {
    if(JSON['name'].match('-') === '-') {
      min = JSON['name'].split('-')[0];
      max = JSON['name'].split('-')[1];
    } else {
      min = max = JSON['name'];
    }
  }
  if(min !== 'u' && max !== 'u') {
    JSON['min'] = min;
    JSON['max'] = max;
  }
  if($(obj).children('ul').length > 0) {
    var children = $(obj).children('ul').children('li');
    var contains = {};
    $(children).each(function(elem) {
      contains[$(children[elem]).children('.label').attr('title')] = recursiveParseJSON(children[elem], min, max);
    });
    JSON['contains'] = contains;
  }
  return JSON;
}

// This function begins the process of publishing a framework to the LRI
function publishJSON(obj) {
  var framework = $(obj).parent().parent('li.framework');
  alert("Your standards are now being published. This make take a few minutes and you may need to reload the Published Public Standards section to see the new framework.");
  recursiveParseLRI(framework, '');
}

// This recursive function parses and publishes the framework to be published
function recursiveParseLRI(obj, parentID) {
  publishing++;
  var theJSON = {};
  theJSON['name'] = $(obj).children('.label').attr('title');
  theJSON['heading'] = $(obj).children('.label').attr('title');
  theJSON['externalId'] = $(obj).children('.label').attr('title');
  theJSON['standard_text'] = $(obj).children('.infoBox').children('.infoDesc').text();
  var query = parentID;
  var newParent = "";
  var writeURL = './ajaxWrite.php?query=' + query;
  $.ajax({
    type: "POST",
    data: JSON.stringify(theJSON),
    processData: false,
    url: writeURL,
    success: function(data, status, jqXHR) {
      newParent = data;
    },
    complete: function() {
      publishing--;
      
      if($(obj).children('ul').length > 0) {
        var children = $(obj).children('ul').children('li');
        $(children).each(function(elem) {
          recursiveParseLRI(children[elem], newParent);
        });
      }
    }
  });
}

// This simple function calls a PHP script which grabs the resources for all of the standards
function loadResources() {
  $.ajax({
    url: './elastic.php',
    success: function(data, status, XHR) {
      resources = JSON.parse(data);
    }
  });
}

// This simple function makes one API call to the LRI to find out the names of the frameworks to show
function loadFrameworkTitles() {
  $.ajax({
    data: {'query': ''},
    url: './niceAjaxRead.php',
    success: function(data, status, XHR) {
      var frameworkTitles = JSON.parse(data);
      frameworkTitles.forEach(function(framework) {
        $('#publicWrapper').append('<div id="public' + publicCount + '"><ul id="publicTree' + publicCount + '"><li class="level0"><a class="label pointer" onClick="recursiveLoadFrameworkLRI(this,\'/' + framework["id"] + '/standards\');">' + framework["heading"] + '</a></li></ul></div>');
        publicCount++;
      });
    },
    error: function(XHR, status, errorThrown) {
      alert(errorThrown);
    }
  });
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function renameKeys(keyMap, obj){
    var oldKeys = Object.keys(keyMap), objLen, i, j, k, len;
    obj = sortByKey(obj, 'externalId');
    
    for(j = 0, objLen = obj.length; j < objLen; j++) {
      for(i = 0, len = oldKeys.length; i < len; i++){
          if(obj[j][oldKeys[i]]){
              obj[j][keyMap[oldKeys[i]]] = obj[j][oldKeys[i]];
              delete obj[j][oldKeys[i]];
              if(typeof obj[j][keyMap[oldKeys[i]]] === 'object'){
                  if(obj[j][keyMap[oldKeys[i]]].length) {
                    renameKeys(keyMap, obj[j][keyMap[oldKeys[i]]])
                  } else {
                    delete obj[j][keyMap[oldKeys[i]]];
                  }
              }
          }
      }
  }
  return obj;
}

// This function calls a recursive script which loads a framework from the LRI and this function creates the tree
function recursiveLoadFrameworkLRI(obj, framework) {
  var publicTree = $(obj).parent('li').parent('ul');
  $(obj).parent('li').html('<li class="level0 label wait">Loading...</li>');
  $.ajax({
    data: {'query': framework},
    url: './niceAjaxRead.php',
    success: function(data, status, XHR) {
      data = renameKeys({"heading":"name","standard_text":"desc","child":"contains","id":"lri_id"},JSON.parse(data));
      var publicHTML = recursiveDataLoad(data,0,false);
      $(publicTree).html(publicHTML);
      $(publicTree).parent('div').tree({
        onCheck: {
          ancestors: 'checkIfFull',
          descendants: 'check'
        },  
        onUncheck: {
          ancestors: 'uncheck'
        },   
        collapseDuration:100,
        expandDuration:100,
      }); 
      $('.label').click(function() {
        $(publicTree).parent('div').tree('expand', $(this).parent());
      });
      $('.label').click(function() {
        $(publicTree).parent('div').tree('collapse', $(this).parent());
      });
      $(publicTree).bind('treeexpand', function() {
        abbreviateChildren($(this).children('ul'));
      });
    },
    error: function(XHR, status, errorThrown) {
      alert(errorThrown);
    }
  });
}

// These functions add standards to the path
function CCtoPath(pathCanvas){
  return toPath($("#commonCore"), pathCanvas);
}
function PublicToPath(pathCanvas){
  var publicTrees = $('#publicWrapper').children('div').toArray();
  for(pTree in publicTrees) {
    toPath($(publicTrees[pTree]), pathCanvas);
  }
  return 0;
}
function PersonalToPath(pathCanvas){
  var personalTrees = $('#personalWrapper').children('div').toArray();
  for(pTree in personalTrees) {
    toPath($(personalTrees[pTree]), pathCanvas);
  }
  return 0;
}

function toPath(baseEl, pathCanvas) {
  // in case the tree hasn't been initialized
  try {

    var leaves = baseEl.tree('getAllCheckedLeaves'), nodeArr = [];

    if($('.filter').attr("id") == 'on' && $(baseEl).parent().attr('id') !== 'personalWrapper') {
      leaves = $(leaves).filter('.filtered');
    }
    if($(baseEl).attr('id') === 'commonCore') {
      var filterGrades;
      gradeLevels.forEach(function(elem) {
        filterGrades = $(filterGrades).add($(leaves).filter('.' + elem + 'grade'));
      });
      leaves = filterGrades;
    }
    $(leaves).each(function(){
      nodeArr.push({
        text: $(this).find(':checkbox').val(),
        info: {
          id: $(this).attr('lriid'),
          name: $(this).find('.infoName').text(),
          type: $(this).find('.infoType').text(),
          desc: $(this).find('.infoDesc').text()
        }
      });
    });

    baseEl.find(':checkbox').prop('checked', false);

    pathCanvas.addNodeList(nodeArr);

  }
  catch(e){}
}
