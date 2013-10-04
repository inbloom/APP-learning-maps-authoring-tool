<?php
$url = 'http://lriserver.inbloom.org/search?opts={"service":"elasticsearch"}';
$curl = curl_init($url);

curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, '{"size":"100000","query":{"filtered":{"query":{"match_all":{}},"filter":{"and":[{"query":{"term":{"schema-org.properties.educationalAlignment.properties.educationalFramework.original":"Common Core State Standards"}}}]}}}}');
$result = json_decode(curl_exec($curl));

$output = array();

foreach($result->{"hits"}->{"hits"} as $item) {
  if(!isset($output[$item->{"_source"}->{"properties"}->{"educationalAlignment"}[0]->{"properties"}->{"targetName"}[0]])) {
    $output[$item->{"_source"}->{"properties"}->{"educationalAlignment"}[0]->{"properties"}->{"targetName"}[0]] = array();
  }
  $resource = array();
  $resource["url"] = $item->{"_source"}->{"properties"}->{"url"}[0];
  $resource["name"] = $item->{"_source"}->{"properties"}->{"name"}[0];
  $output[$item->{"_source"}->{"properties"}->{"educationalAlignment"}[0]->{"properties"}->{"targetName"}[0]][] = $resource;
}

print json_encode($output);
curl_close($curl);

?>
