<?php
header('Content-type: application/json');

$server = 'http://localhost:8080';
$query = '/lri-reboot/learningmaps';

$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $server . $query);

$response = json_decode(curl_exec($curl));

curl_close($curl);

print json_encode($response);

?>
