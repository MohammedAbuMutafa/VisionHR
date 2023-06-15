const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const upload = multer({ dest: './' });

app.post('http://localhost:3000/', upload.single('video'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No video file received');
  }

  // Move the file to the server's root folder
  const destinationPath = `./recordedVideo.webm`;
  fs.renameSync(file.path, destinationPath);

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Server is running on port 5173');
});
