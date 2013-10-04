<?php
header('Content-type: application/json');

$id = $_GET["pathId"];

function pathSort($a, $b) {
  $aStep = explode("_", $a->{"urn:lri:property_type:id"});
  $bStep = explode("_", $b->{"urn:lri:property_type:id"});

  $aStep = $aStep[count($aStep)-1];
  $bStep = $bStep[count($bStep)-1];

  return strcmp($aStep, $bStep);
}
function processResponse($res) {
  if(!$res){
    curl_error($curl);
    throw new Exception("When getting path container: " . curl_error($curl));
  }
  if($res->status == "error") {
    throw new Exception("When getting path container: " . implode(" --- ", $res->message));
  }


  $response = $res->{"response"}[0]->props;

  $returnObject = array(
    "status" => "ok",
    "id" => $response->{"urn:lri:property_type:id"},
    "name" => $response->{"urn:lri:property_type:name"},
  );

  $outputSteps = array();
  $steps = $response->{"urn:lri:property_type:contains"};

  if(!is_array($steps)) {
    $steps = array( $steps );
  }

  //sort
  usort($steps, pathSort);

  for($i = 0; $i < count($steps); $i++) {
    if(strpos($steps[$i], "urn:lri:path_step:") !== false){
      $step = getPathStep($steps[$i]);
      array_push($outputSteps, $step);
    }
    else if(strpos($steps[$i], "urn:lri:competency_path:") !== false){
      $step = getGroup($steps[$i]);
      array_push($outputSteps, $step);
    }
  }

  $returnObject["steps"] = $outputSteps;

  return $returnObject;
}

function getGroup($id) {
  global $curl, $server;

  $query = '/entity/search?opt{"cache":false}&q={"urn:lri:property_type:id":"' . $id . '"}';
  curl_setopt($curl, CURLOPT_URL, $server . $query);

  $res = json_decode(curl_exec($curl));
  if(!$res){
    curl_error($curl);
    throw new Exception("When getting group container: " . curl_error($curl));
  }
  else if($res->status == "error") {
    throw new Exception("When getting group container: " . implode(" --- ", $res->message));
  }

  $contains = $res->response[0]->props->{"urn:lri:property_type:contains"};

  $retObj = array(
    "type" => "group"
  );

  $steps = array();

  for($i = 0; $i < count($contains); $i++){
    array_push($steps, getPathStep($contains[$i]));
  }

  $retObj["steps"] = $steps;

  return $retObj;
}

function getPathStep($id) {
  global $curl, $server;

  $query = '/entity/search?opt{"cache":false}&q={"urn:lri:property_type:id":"' . $id . '"}';
  curl_setopt($curl, CURLOPT_URL, $server . $query);

  $res = json_decode(curl_exec($curl));
  if(!$res){
    curl_error($curl);
    throw new Exception("When getting path step: " . curl_error($curl));
  }
  if($res->status == "error") {
    throw new Exception("When getting path step: " . implode(" --- ", $res->message));
  }

  $retObj = array(
    "type" => "standard",
    "competencyUrn" => $res->response[0]->props->{"urn:lri:property_type:competency_in_path"},
    "name" => $res->response[0]->props->{"urn:lri:property_type:name"}
  );

  return $retObj;
}


//$server = 'http://ec2-50-16-92-219.compute-1.amazonaws.com:8000';
//$query = '/entity/search?opt{"cache":false}&q={"urn:lri:property_type:id":"' . $id . '"}';
$server = 'http://ec2-54-211-165-17.compute-1.amazonaws.com:8080';
$query = '/lri-reboot-0.1.0.BUILD-SNAPSHOT/learningmaps/' . $id;

$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $server . $query);

$response = json_decode(curl_exec($curl));


//try {
//  $test = processResponse($response);
//}
//catch( Exception $e ){
//  $test = array(
//    "status" => "error",
//    "message" => $e->getMessage()
//  );
//}


print json_encode($response);

curl_close($curl);

?>
