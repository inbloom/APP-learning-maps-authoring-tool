<?php

if(isset($_GET['query'])) {
  $query = $_GET['query'];
} else {
  $query = "";
}

$curl = curl_init();

curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$data = api_call($curl, $query);

curl_close($curl);

print $data;

function api_call($curl, $query) {
  $newData = array();
  $base_url = 'http://localhost:8080/lri-reboot/standards';
  curl_setopt($curl, CURLOPT_URL, $base_url . $query);
  $data = curl_exec($curl);
  return $data;
}
/*  print json_decode($data);
  if(!empty($data)) {
    foreach($data as $standard) {
      $newData[] = $standard;
    }
  } else if($query) {
    $newData = $data;
  }
  return $newData;
}

/*
132           if(data["response"][0]["props"].hasOwnProperty("urn:lri:property_type:description")) {
133             newJSON[name]["text"] = data["response"][0]["props"]["urn:lri:property_type:description"];
134           }
135           if(data["response"][0]["props"].hasOwnProperty("urn:lri:property_type:contains")) {
140             }
*/

?>
