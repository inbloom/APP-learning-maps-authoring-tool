<?php
/*
session_start();

        const CLIENT_ID = 'zgdxhn67ir';
        const CLIENT_SECRET = '0ka2ghpv381xo4j4qs0p13bj8x1leswnlaorzksnzuw4cgb7';

        const REDIRECT_URI = 'http://localhost/inBloom4/';
        const AUTHORIZATION_ENDPOINT = 'https://api.sandbox.inbloom.org/api/oauth/authorize';
        const TOKEN_ENDPOINT = 'https://api.sandbox.inbloom.org/api/oauth/token';

if (!isset($_GET['code'])) {
  $url = AUTHORIZATION_ENDPOINT . '?client_id=' . CLIENT_ID . '&redirect_uri=' . REDIRECT_URI;
  header('Location: ' . $url);
  die('Redirect');
} else {

  $url = TOKEN_ENDPOINT . '?client_id=' . CLIENT_ID . '&client_secret=' . CLIENT_SECRET . '&grant_type=authorization_code&redirect_uri=' . REDIRECT_URI . '&code=' . $_GET['code'];

  $ch = curl_init();

//set the url, number of POST vars, POST data
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
  curl_setopt($ch, CURLOPT_HEADER, 'Content-Type: application/vnd.slc+json');
  curl_setopt($ch, CURLOPT_HEADER, 'Accept: application/vnd.slc+json');

//execute post
  $result = curl_exec($ch);

//close connection
  curl_close($ch);

// de-serialize the result into an object
  $result = json_decode($result);

  if ($result == '') {
    header('Location: .');
  }


// set the session with the access_token and verification code
  $_SESSION['access_token'] = $result->{"access_token"};
  $_SESSION['code'] = $_GET['code'];

  if (isset($result->{"error"})) {
    echo 'Error: ' . $result->{"error"} . '<br/><br/>';
    echo $result->{"error_description"};
  }
  else {
 */
    print<<<HEAD
<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">
    <title>inBloom Learning Map Path Authoring Tool</title>
    <link href="./css/normalize.css" rel="stylesheet" type="text/css">
    <link href="./css/tinyContextMenu.css" rel="stylesheet" type="text/css">
    <link href="./css/spectrum.css" rel="stylesheet" type="text/css">
    <link href="./css/index.css" rel="stylesheet" type="text/css">
    <link href="./css/paths.css" rel="stylesheet" type="text/css">
    <link href="./css/standards.css" rel="stylesheet" type="text/css">
    <link href="./css/print.css" rel="stylesheet" type="text/css">
    <link href="./css/inbloom-sprites.css" rel="stylesheet" type="text/css">

    <script src="js/lib/modernizr/modernizr.js"></script>

    <!-- start checkboxTree configuration -->
    <script type="text/javascript" src="js/lib/jquery/jquery.js"></script>
    <script type="text/javascript" src="js/lib/jquery-ui/jquery-ui.js"></script>

    <script type="text/javascript" src="js/lib/jquery-tree/jquery.tree.js"></script>
    <!-- end checkboxTree configuration -->

    <script type="text/javascript" src="./js/UIfunctions.js"></script>
    <script type="text/javascript" src="./js/createTrees.js"></script>
  </head>
  <body>
    <div id="header">
      <img src="./images/inbloom-logo.png"/>
HEAD;
/*
   Login code and stuff that doesn't fit with the new style 
   Should fix if authentication is put back in

    print '<div id="header-right">';
    $url = 'https://api.sandbox.inbloom.org/api/rest/v1.2/home';
    $headers = array('Content-Type: application/vnd.slc+json', 'Accept: application/vnd.slc+json', 'Authorization: bearer ' . $result->{"access_token"});
    $ch = curl_init();
    print "<div id='token' style='display:none;'>" . $result->{"access_token"} . "</div>";

// set the url and headers
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($ch);

    $url = json_decode($result)->{"links"}[0]->{"href"};

    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);
  //close connection
    curl_close($ch);

    $result = json_decode($result);
// check that user is a teacher
    if ( $result->{"entityType"} === "teacher" ) {
      print "<div id='username' style='display:none;'>" . $result->{"id"} . "</div>";
      print "Welcome, " . $result->{"name"}->{"personalTitlePrefix"} . ". " . $result->{"name"}->{"firstName"} . " " . $result->{"name"}->{"lastSurname"} . "!";
      print "</div>";
 */
      print<<<MAP
    </div>
    <div class="header-title">
      LEARNING MAP AUTHORING TOOL v0.9.8
    </div>
    <div class="pageBody">
    <div class="grade-bar">
      <div class="grade-contain">
        <div id="gradeLabel">Select Grade Level(s):</div>
        <button id="0" onClick="gradeButton(this);" class="gradeButton pointer">K</button>
        <button id="1" onClick="gradeButton(this);" class="gradeButton pointer">1</button>
        <button id="2" onClick="gradeButton(this);" class="gradeButton pointer">2</button>
        <button id="3" onClick="gradeButton(this);" class="gradeButton pointer">3</button>
        <button id="4" onClick="gradeButton(this);" class="gradeButton pointer">4</button>
        <button id="5" onClick="gradeButton(this);" class="gradeButton pointer">5</button>
        <button id="6" onClick="gradeButton(this);" class="gradeButton pointer">6</button>
        <button id="7" onClick="gradeButton(this);" class="gradeButton pointer">7</button>
        <button id="8" onClick="gradeButton(this);" class="gradeButton pointer">8</button>
        <button id="9" onClick="gradeButton(this);" class="gradeButton pointer">9</button>
        <button id="10" onClick="gradeButton(this);" class="gradeButton pointer">10</button>
        <button id="11" onClick="gradeButton(this);" class="gradeButton pointer">11</button>
        <button id="12" onClick="gradeButton(this);" class="gradeButton pointer">12</button>
      </div>
    </div>
    <div id="standards-list">
      <form id="searchForm" action="javascript:filter(this);" method="post">
        <div id="off" class="filter">
          <input type="search" results=5 autosave=40358 placeholder="Filter..." id="filter-input" name="standards-filter" />
          <input title="Filter Common Core Standards and Public Standards by search terms" type="submit" class="filter-btn" value="" />
        </div>
      </form>
      <div class="accordion">
        <div class="category-headings pointer">Common Core State Standards<div></div></div>
        <div id="commonCoreWrapper">
          <select title="Choose the Subject" name="subject" class="subjectDrop" onChange="subjectButton(this);">
            <option value="Math">Mathematics</option>
            <option value="ELA-Literacy">ELA-Literacy</option>
          </select>
          <input title="Copy checked standards to the Draft section" type="button" onclick="copyCCStandards(this);" value="Copy to Draft">
          <input title="Add the checked standards to the Path Window" type="button" onclick="CCtoPath(pathCanvas);" value="Add Path">
          <div id="commonCore">
          </div>
        </div>
        <div class="category-headings pointer">Published Public Standards<div></div></div>
        <div id="publicWrapper">
          <input title="Copy checked standards to the Draft section" type="button" onclick="copyPublicStandards(this);" value="Copy to Draft">
          <input title="Add the checked standards to the Path Window" type="button" onclick="PublicToPath(pathCanvas);" value="Add Path">
        </div>
        <div class="category-headings pointer">Draft (Personal Learning Map)<div></div></div>
        <div id="personalWrapper">
          <input title="Upload a standards JSON file" type="file" id="files" name="files[]" multiple size="20"/><br/>
          <input title="Create a new standard" type="button" onclick="addStandard();" value="Create Element">
          <input title="Delete all checked standards" type="button" onclick="deleteStandards();" value="Delete">
          <input title="Add the checked standards to the Path window" type="button" onclick="PersonalToPath(pathCanvas);" value="Add Path">
        </div>
      </div>
    </div> 
    <div id="path-outer-container">
      <div id="public-paths" class="modal-outer">
        <div class="modal-header">
          <div class="modal-title">Choose a public path</div>
          <div class="modal-buttons">
            <input id="public-path-ok" class="modal-button" type="button" value="load path"><input id="public-path-cancel" class="modal-button" type="button" value="cancel">
          </div>
        </div>
        <div class="modal-content">
          <div class="modal-section">
            <h3>Published Paths</h3>
            <div>
              <select id="published-path-list">
                <option>Choose a path...</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div id="skin-mode">
        <div id="skin-header">
          <div id="skin-title">Skin Mode</div>
          <div id="skin-buttons">
            <input id="skin-ok" type="button" value="apply" class="skin-button"><input id="skin-cancel" type="button" value="cancel" class="skin-button">
          </div>
        </div>
        <div id="skin-content">
        <div id="skin-background">
  <h3>Customize background</h3>
          <label for="background-upload">Upload an Image for background</label>
          <input id="background-upload" type="file">
        </div>
          <div id="skin-node">
            <h3>Customize Node</h3>
            <div id="sample-node-container">
              <div id="sample-node">Sample Node</div>
            </div>
            <div id="node-color">
              <label for="choose-node-color">Node color: </label>
              <input type="color" value="#3C97CC" id="choose-node-color">
            </div>
            <div id="text-color">
              <label for="choose-node-text">Node Text Color: </label>
              <input type="color" value="#FFFFFF" id="node-text-color">
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    <footer>
      <div id="footer-left">inBloom is a trademark of inBloom, Inc.</div>
      <div id="footer-right">
        <a href="./help.html" target="_blank">Help</a> | 
        <a href="#" onclick="if(confirm('You are now going to the inBloom support website. You\'ll need to register in order to provide a bug or feature report. Registration is free. Click OK to go to http://support.inbloom.org')) { window.location='http://support.inbloom.org';}">Report Issue</a> |
        <a href="http://www.inbloom.org/terms-of-use" target="_blank">Terms of Use</a> |
        <a href="http://www.inbloom.org/privacy-policy" target="_blank">Privacy Policy</a>
    </div>
    </footer>
    <div id="node-info">
      <div class="x-button">x</div>
      <div class="node-info-title"></div>
      <div class="node-info-desc"></div>
    </div>
    <ul id="node-menu" class="tiny-context-menu">
      <li data-action="info">Info</li>
      <li data-action="rename">Rename</li>
      <li class="ungroup" data-action="ungroup">Ungroup</li>
      <li data-action="delete">Delete</li>
    </ul>
    <div id="path-toolbar-tmpl">
      <div class="path-toolbar">
        <ul class="toolbar-item-container">
          <li title="Undo" class="hidden" data-mode="undo"><span class="sprite undo"></span></li>
          <li title="Redo" class="hidden" data-mode="redo"><span class="sprite redo"></span></li>
          <li title="Selection Tool" class="toolbar-item" data-mode="move"><span class="sprite select"></span></li>
          <li title="Connection Tool" class="toolbar-item" data-mode="path"><span class="sprite path"></span></li>
          <li title="Disconnection Tool" class="toolbar-item" data-mode="breakpath"><span class="sprite breakpath"></span></li>
          <li title="New Path" class="toolbar-item" data-mode="new"><span class="sprite new"></span></li>
          <li title="Open Path" class="toolbar-item" data-mode="open"><span class="sprite open"></span>
            <ul class="open-path tiny-context-menu">
              <li data-action="local">Open Local File</li>
              <li data-action="public">Open Public File</li>
            </ul>
          </li>
          <li title="Save Path" class="toolbar-item" data-mode="save"><span class="sprite save"></span>
            <ul class="save-path tiny-context-menu">
              <li data-action="local">Save to Local File</li>
              <li data-action="public">Publish Path</li>
            </ul>
          </li>
          <li title="Delete Path" class="toolbar-item" data-mode="delete"><span class="sprite delete"></span></li>
          <li title="Print Path" class="toolbar-item" data-mode="print"><span class="sprite printer"></span></li>
          <li title="Customize Path" class="toolbar-item" data-mode="style"><span class="sprite dup"></span></li>
        </ul>
        <input type="file" accept="application/json" class="hidden" id="path-file" />
      </div>
    </script>
    <script src="js/lib/raphael/raphael.js"></script>
    <script src="js/lib/tinyContextMenu.js"></script>
    <script src="js/lib/spectrum/spectrum.js"></script>
    <script src="js/LRNode.js"></script>
    <script src="js/LRConnector.js"></script>
    <script src="js/LRGroup.js"></script>
    <script src="js/skinPath.js"></script>
    <script src="js/PathCanvas.js"></script>
    <script src="js/main.js"></script>
    <script src="js/lib/downloadJSON.js"></script>
  </body>
</html>
MAP;
      /*
    } else {
      print "You must be logged in to use this application";
      print<<<NOT_LOGGED
      </div>
    </div>
    <div id="footer">
      <div id="footer-left">inBloom is a trademark of inBloom, Inc.</div>
      <div id="footer-right">
        <a href="./help.html" target="_blank">Help</a> | 
        <a href="#" onclick="if(confirm('You are now going to the inBloom support website. You\'ll need to register in order to provide a bug or feature report. Registration is free. Click OK to go to http://support.inbloom.org')) { window.location='http://support.inbloom.org';}">Report Issue</a> |
        <a href="http://www.inbloom.org/terms-of-use" target="_blank">Terms of Use</a> |
        <a href="http://www.inbloom.org/privacy-policy" target="_blank">Privacy Policy</a>
    </div>
  </body>
</html>
NOT_LOGGED;
    }
  }
}
       */
?>
