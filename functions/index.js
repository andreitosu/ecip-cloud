const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const projectId = 'ecip-e56df';
let gcs = new Storage ({
  projectId
});
const path = require('path');
const sharp = require('sharp');
const os = require('os');
const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});

const THUMB_MAX_WIDTH = 200;
const THUMB_MAX_HEIGHT = 200;
const ANGLE = 90;

// File extension for the created JPEG files.
const JPEG_EXTENSION = '.jpg';

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.onFileChange = functions.storage.object().onFinalize(object => {

  console.log(object);

  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.

  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  // Get the file name.
  const fileName = path.basename(filePath);
  // Exit if the image is already a thumbnail.
  if (fileName.startsWith('editat')) {
    console.log('Already Edited.');
    return null;
  }

  // Download file from bucket.
  const bucket = gcs.bucket(fileBucket);

  const metadata = {
    contentType: contentType,
  };
  // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
  const thumbFileName = `editat${fileName}`;
  const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
  // Create write stream for uploading thumbnail
  const thumbnailUploadStream = bucket.file(thumbFilePath).createWriteStream({metadata});

  // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
  const pipeline = sharp();
  pipeline.resize({width:THUMB_MAX_WIDTH,
     height: THUMB_MAX_HEIGHT,
     fit: sharp.fit.inside,
     position: sharp.strategy.entropy});//. pipe(thumbnailUploadStream);
 
    if(fileName.startsWith('r8c')){
        pipeline.rotate(ANGLE); //Rotire
        console.log('Rotire');
    }

    if(fileName.startsWith('n6w')){
        pipeline.negate(true); // Negativ
        console.log('Negativ');
    }

    if(fileName.startsWith('b3q')){
        pipeline.blur(3);
        console.log('Blur');
    }

    if(fileName.startsWith('5Qw')){
        pipeline.modulate({ 
            brightness: 0.2,
            saturation: 0.4,
            hue: 10
          });
          console.log('Filtru 1');
    }

    if(fileName.startsWith('p0t')){
        pipeline.modulate({ 
            brightness: 0.5,
            saturation: 0.6,
            hue: 90
          });
          onsole.log('Filtru 2');
    }

    if(fileName.startsWith('f87b')){
        pipeline.modulate({ 
            brightness: 0.9,
            saturation: 0.9,
            hue: 30
          });
          onsole.log('Filtru 3');
    }

    // pipeline.threshold(150);

  bucket.file(filePath).createReadStream().pipe(pipeline).pipe(thumbnailUploadStream);

  console.log(filePath);
  console.log(thumbFilePath);
  console.log(thumbnailUploadStream);

  return new Promise((resolve, reject) =>{
      thumbnailUploadStream.on('finish', resolve).on('error', reject)
  });
});
