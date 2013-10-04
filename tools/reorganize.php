<?php

/**
 * This script is for transforming the Common Core State Standards JSON that Agilix uses
 * into the JSON that we want to use for our application
 */

$data = file_get_contents('./data/ccss-sorted.json');

// We grab their JSON, decode it for PHP, run the recursive script and then encode it
$newData = json_encode(recursive_organize(json_decode($data), 0, ""));

// Write the output into a file
file_put_contents("./data/ccss.json", $newData);

// Print the output to the screen
print $newData;

// The resursive script requires the JSON, the current depth, and a breadcrumb-type string
function recursive_organize($data, $depth, $ccss_id) {
  $newJSON = array();

  // The first level only contains the CCSS key and doesn't need a ccss_id
  if($depth !== 0) { $newJSON["ccss_id"] = $ccss_id; }

  foreach ($data as $name => $value) {

// Setting the type element is a hacky business - no good reference in original JSON
// At the first level (CCSS), it's just "initiative"
    if($depth === 1) { $newJSON["type"] = "initiative"; }
// Math and ELA are frameworks
    if($depth === 2) { $newJSON["type"] = "framework"; }
// Math splits into sets, while ELA splits into domains and one set (CCRA)
    if($depth === 3) {
      if(explode(" ", $data->{"_text"})[0] === "ELA-Literacy") {
// The type is found as the second word in the text for ELA...
        $newJSON["type"] = strtolower(explode(" ", $data->{"_text"})[1]);
      } else {
// ...and the first word for the text in Math. So fun!
        $newJSON["type"] = strtolower(explode(" ", $data->{"_text"})[0]);
      }
    }
// At this level, the Math Practice set has standards, the CCRA set has strands,
// and everything else is found as the second word in the text element
    if($depth === 4) {
      if(explode(".", $ccss_id)[2] === "Practice") {
        $newJSON["type"] = "standard";
      } else if(explode(" ", $data->{"_text"})[0] === "Strand"){
        $newJSON["type"] = "strand";
      } else {
        $newJSON["type"] = strtolower(explode(" ", $data->{"_text"})[1]);
      }
    }
// At this level, ELA has standards, but the text element now contains the text
// of the standard... The Math is generally at the domain level
    if($depth === 5) {
      if(explode(".", $ccss_id)[1] === "ELA-Literacy") {
        $newJSON["type"] = "standard";
      } else {
        $newJSON["type"] = strtolower(explode(" ", $data->{"_text"})[1]);
      }
    }
// At this level, ELA has components. Math is at the cluster level
    if($depth === 6) {
      if(explode(".", $ccss_id)[1] === "ELA-Literacy") {
        $newJSON["type"] = "component";
// The name 'standard_component' seems redundant, but I need a correct property id for the LRI
        $lri_type = "standard_component";
      } else {
        $newJSON["type"] = strtolower(explode(" ", $data->{"_text"})[1]);
      }
    }
// ELA doesn't get to this level and Math should be at the standards level
    if($depth === 7) {
      $newJSON["type"] = "standard";
    }
// ELA doesn't get to this level and Math should be at the components level
    if($depth === 8) {
      $newJSON["type"] = "component";
      $lri_type = "standard_component";
    }
    if($depth === 0) {
      // At the first level, we don't need to do the "contains" nor create the ccss_id
      $ccss_id = $name;
      $newJSON[$name] = recursive_organize($value, $depth + 1, $ccss_id);
    } else {
      $newJSON["ccss_id"] = $ccss_id;
      if($name[0] === "_") {
// We don't need them, so let's remove the underscores
        if($name === "_min") {
          $name = "min";
        }
        if($name === "_max") {
          $name = "max";
        }
        if($name === "_order") {
          $name = "order";
        }
        $newJSON[$name] = $value;
      } else {
        // Increase the depth, add to the ccss_id breadcrumbs, and send the child JSON to get parsed
        $newJSON["contains"][$name] = recursive_organize($value, $depth + 1, $ccss_id . "." . $name);
      }
    }
  }
  if($depth != 0) {
// setting the lri_id
    if(isset($lri_type)) {
      $newJSON["lri_id"] = "urn:ccss:" . $lri_type . ":" . $newJSON["ccss_id"];
      $newJSON["ccss_id"] = substr($newJSON["ccss_id"], 0, -2) . substr($newJSON["ccss_id"],-1);
    } else {
      $newJSON["lri_id"] = "urn:ccss:" . $newJSON["type"] . ":" . $newJSON["ccss_id"];
    }
// _text was being used for identification and for standard and component descriptions - let's fix that
    if($newJSON["type"] === "standard" || $newJSON["type"] === "component") {
      $newJSON["desc"] = strip_tags($newJSON["_text"]);
    } else if(isset($newJSON["_text"])) {
      $newJSON["name"] = $newJSON["_text"];
    }
// We can set the name for the CCSS and for Math and ELA
// TODO: Set names for all of the domains and grades?
// *** Be careful with 'MD' in Math -   Measurement & Data   *AND*   Using Probability to Make Decisions   ***
    if($depth === 1) { $newJSON["name"] = "Common Core State Standards"; }
    if($depth === 2) { $newJSON["name"] = end(explode(".", $ccss_id)); }
    unset($newJSON["_text"]);
  }

  // Send back the JSON at this level
  return $newJSON;
}

?>
