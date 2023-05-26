const express = require('express');
const Multer = require('multer');
const { google } = require('googleapis');
const cors = require("cors");
const bp = require('body-parser')

var corsOptions = {
    origin: "*"
};

const app = express();

app.use(bp.json({limit:'150mb'}))

app.use(bp.urlencoded({limit: "150mb", extended: true}))

app.use(cors(corsOptions));

const multer = Multer({
    storage: Multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, `${__dirname}/audio-files`);
      },
      filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  const authenticateGoogle = () => {
    const auth = new google.auth.GoogleAuth({
      keyFile: `./client_secret_1069685264972-mr3ocvl3n62e41iut4ai0c2dcph2idpu.apps.googleusercontent.com.json`,
      scopes: "https://www.googleapis.com/auth/drive",
    });
    return auth;
  };

  const uploadToGoogleDrive = async (file, auth) => {
    const fileMetadata = {
      name: file.originalname,
      parents: ["1i-4EogO71I9j-UKic8cfOcE4BdUNQgJu"], // Change it according to your desired parent folder id
    };
  
    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };
  
    const driveService = google.drive({ version: "v3", auth });
  
    const response = await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });
    return response;
  };

  app.post("/upload", multer.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        console.log(req)
        res.status(400).send("No file uploaded.");
        return;
      }
      const auth = authenticateGoogle();
      const response = await uploadToGoogleDrive(req.file, auth);
      deleteFile(req.file.path);
      res.status(200).json({ response });
    } catch (err) {
      console.log(err);
  }
    });

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
