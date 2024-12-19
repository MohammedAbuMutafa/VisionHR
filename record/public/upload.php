<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Handle snapshot upload
if ($_FILES['snapshotBlob']) {
  $tempFile = $_FILES['snapshotBlob']['tmp_name'];
  $fileName = $_FILES['snapshotBlob']['name'];
  $extension = pathinfo($fileName, PATHINFO_EXTENSION);
  
  $currentStep = $_POST['currentStep']; // Get the currentStep from the POST data

  // Determine the prefix based on the current step
  $prefix = ($currentStep === '1') ? 'step1' : 'step2';
  
  $targetFile = './Snapshots/' . $prefix . '-Snapshot-' . date('Y-m-d-h') . '.' . $extension;

  // Move the temporary file to the target location
  move_uploaded_file($tempFile, $targetFile);

  // Check if the file was successfully moved
  if (file_exists($targetFile)) {
    echo 'Snapshot uploaded successfully.';
  } else {
    echo 'Failed to upload snapshot.';
  }
}

// Handle the coordinates data
$x = $_POST['x'];
$y = $_POST['y'];

// You can do any processing or storage of the coordinates here
// For example, storing them in a database or a text file

// Print the coordinates in the response
echo 'Coordinates: x = ' . $x . ', y = ' . $y;
?>
