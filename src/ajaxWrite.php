<?php

if(isset($_GET['query'])) {
  $query = "/" . $_GET['query'];
} else {
  $query = "";
}

$data = file_get_contents('php://input');

$url = 'http://ec2-54-211-165-17.compute-1.amazonaws.com:8080/lri-reboot-0.1.0.BUILD-SNAPSHOT/standards';
$curl = curl_init($url . $query);

curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
//curl_setopt($curl, CURLOPT_VERBOSE, true);
curl_setopt($curl, CURLOPT_HEADER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER,array(
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data))
);

$returndata = curl_exec($curl);
/*
$header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);

$header = substr($returndata, 0, $header_size);
$body = substr($returndata, $header_size);
*/
curl_close($curl);

$safeURL = preg_quote($url, "/");
if(preg_match("/$safeURL\/(.*)\r?\n/", $returndata, $match)) {
  print $match[1];
}


?>
