<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
if ($_FILES['recordedBlob']) {
  $tempFile = $_FILES['recordedBlob']['tmp_name'];
  $fileName = $_FILES['recordedBlob']['name'];
  $extension = pathinfo($fileName, PATHINFO_EXTENSION);
  $targetFile = './RecordedVideo-' . date('Y-m-d') . '.' . $extension;

  // Move the temporary file to the target location
  move_uploaded_file($tempFile, $targetFile);

  // Check if the file was successfully moved
  if (file_exists($targetFile)) {
      echo 'File uploaded successfully.';
  } else {
      echo 'Failed to upload file.';
  }
}

