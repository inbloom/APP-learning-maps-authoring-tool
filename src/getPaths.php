<?php
header('Content-type: application/json');

$server = 'http://ec2-54-211-165-17.compute-1.amazonaws.com:8080';
$query = '/lri-reboot-0.1.0.BUILD-SNAPSHOT/learningmaps';

$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $server . $query);

$response = json_decode(curl_exec($curl));

curl_close($curl);

print json_encode($response);

?>
