const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const { connectMongoose, User, pdfSchema, Message } = require("./database.js");
const passport = require("passport");
const {
  initializingPassport,
  isAuthenticated,
} = require("./passportConfig.js");
const expressSession = require("express-session");
const hbs = require("hbs");
const ejs = require("ejs");
const fs = require("fs");
const axios = require('axios'); 
const {Storage} = require('@google-cloud/storage');
const admin = require('firebase-admin');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
var upload = multer({ storage: storage })

// Initialize Firebase Admin SDK
const serviceAccount = require('./hivemind-382804-firebase-adminsdk-pdnb4-3898724047.json');
const { Timestamp } = require("mongodb");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://hivemind-382804.appspot.com/',
});
const bucket = admin.storage().bucket();



connectMongoose();

initializingPassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../")));
app.use(
  expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../html"));

app.get("/", (req, res) => {
  res.render("HomePage", {req : req});
});

app.get("/SignUp", (req, res) => {
  res.render("SignUp");
});

app.get("/Login", (req, res) => {
  res.render("Login");
});

app.get("/Resources", (req, res) => {
  res.render("Resources");
});

app.get("/ContactUs", (req, res) => {
  res.render("ContactUs");
});


app.post("/SignUp", upload.single('img'), async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send("User already exists!");
  const newUser = await User.create({
    name: req.body.name,
    img: req.file ? fs.readFileSync("uploads/" + req.file.filename) : fs.readFileSync("uploads/" + "stock.jpeg"),
    joinDate: new Date(),
    username: req.body.username,
    password: req.body.password
  });

  if (req.file) {
  const filesToDelete = [];
  const filepathToDelete = "uploads/" + req.file.filename
  filesToDelete.push(filepathToDelete);
  deleteFiles(filesToDelete);
  };
  res.redirect("/");
});


app.get("/PdfViewer", (req,res)=>{
  if(req.method == 'GET')
  {
    res.redirect("/Upload");
  }
})



app.post("/PdfViewer", upload.single('myPdf'), async (req, res) => {
    try {
        const pdf = fs.readFileSync(req.file.path);

        //Upload to Firebase Storage
        const bucketName = bucket.name;
        const folderName = "pdfs";
        const fileName = req.file.originalname;
        const fileUpload = bucket.file(`${folderName}/${fileName}`);
        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
      },
    });

    blobStream.on("error", (error) => {
      console.log(error);
      res.status(500).send("Failed to upload file to Firebase Storage");
    });
    blobStream.on("finish", async () => {
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(fileUpload.name)}?alt=media`;
        const final_pdf = {
            filename : req.body.title,
            filedesc : req.body.description,
            uploadDate : Date.now(),
            pdfUrl : fileUrl,
             username : req.user.username
      };

      // Validate the username field before creating a new PDF object
      if (!final_pdf.username) {
        res.status(400).send("Username is required");
        return;
      }

        const result = await pdfSchema.create(final_pdf);
        console.log(`Saved PDF to database with ID ${result._id}`);

        res.render('calibration', {id : `${result.id}`});
      });

       blobStream.end(pdf);
       const filesToDelete = [];
       const filepathToDelete = "uploads/" + req.file.filename
       filesToDelete.push(filepathToDelete);
       deleteFiles(filesToDelete)
    } catch (err) {
        console.log(err);
        res.status(500).send("Failed to save PDF to database");
    }
});


app.get("/pdf/:id", isAuthenticated, async (req, res) => {
  const pdfId = req.params.id;

  try {
    // Find the document with the specified ID in the MongoDB collection
    const pdf = await pdfSchema.findById(pdfId);

    if (!pdf) {
      // Return a 404 error if the document is not found
      return res.status(404).send("PDF not found");
    }

    console.log(`pdfId: ${pdfId}`);
    console.log(`pdfUrl: ${pdf.pdfUrl}`);
    const Url = pdf.pdfUrl;
    res.render('PdfViewer.ejs', {Url});

  } catch (error) {
    console.error(error);

    if (error.code === 404) {
      return res.status(404).send("PDF not found");
    }

    res.status(500).send("Internal server error");
  }
});

app.get("/Uploaded", isAuthenticated,  async (req, res) => {
  try {
    const pdfs = await pdfSchema.find({ username: req.user.username }).sort({ uploadDate: -1 });
    if(pdfs.length === 0){
      res.redirect("/Upload");
    } else{
      res.render("uploaded_material", { pdfs });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});



app.get('/Discussion', isAuthenticated, async (req, res) => {
  try {
    // Fetch all the messages from the database
    const messages = await Message.find().sort({ timestamp: -1 }).limit(10);

    // Render the discussion view with all the messages
    res.render('Discussion', { messages });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/Discussion', isAuthenticated, upload.single('img'), async (req, res) => {
  try {
    // Create a new message from the request body
    const newMessage = new Message({
      name: req.user.name,
      body: req.body.body,
      img: req.file ? fs.readFileSync("uploads/" + req.file.filename) : undefined
    });

    // Save the message to the database
    await newMessage.save();

    if (req.file) {
    const filesToDelete = [];
    const filepathToDelete = "uploads/" + req.file.filename
    filesToDelete.push(filepathToDelete);
    deleteFiles(filesToDelete)
    };

    // Render the discussion view with the new message and all the existing messages
    res.redirect('/Discussion');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }

});
 
app.post(
  "/Login",
  passport.authenticate("local", { failureRedirect: "/Login" }),
  (req, res) => {
    res.redirect("/Dashboard");
  }
);

app.get("/Profile", isAuthenticated, (req, res) => {
  res.render("Profile", req.user);
});

app.get("/Logout", (req, res, done) => {
  req.logOut((err) => {
    if (err) return done(err);
    res.redirect("/");
  });
});

app.get("/Dashboard", isAuthenticated,  (req, res) => {
  res.render("Dashboard", {req : req});
});

app.get("/Quiz", isAuthenticated,  (req, res) => {
  res.render("Quiz", {req : req});
});

app.get("/sciencequiz", isAuthenticated,  (req, res) => {
  res.render("sciencequiz", {req : req});
});

app.get("/mathsquiz", isAuthenticated,  (req, res) => {
  res.render("mathsquiz", {req : req});
});

app.get("/csquiz", isAuthenticated,  (req, res) => {
  res.render("csquiz", {req : req});
});

app.get("/AboutUs", (req, res) => {
  res.render("AboutUs");
});

app.get("/Settings", isAuthenticated, (req, res) => {
  res.render("Settings", req.user);
});

app.post("/Settings", upload.single('img'), async (req, res) => {

  const username = req.body.username;
  req.user.name = req.body.name || req.user.name;
  req.user.username = req.body.email || req.user.username;
  req.user.password = req.body.password || req.user.password;
  req.user.notifications = req.body.notifications || req.user.notifications;
  req.user.img = req.file?.filename ? fs.readFileSync("uploads/" + req.file.filename) : req.user.img;  
  await req.user.save(); 
  const filesToDelete = [];
  const filepathToDelete = "uploads/" + req.file.filename
  filesToDelete.push(filepathToDelete);
  deleteFiles(filesToDelete)
  res.redirect("/Profile");
});


app.get("/Upload", isAuthenticated, (req, res) => {
  res.render("UploadPage");
});

app.get("/html/book", isAuthenticated, (req, res) => {
  res.render("book");
})

function deleteFiles(filesToDelete) {
  filesToDelete.forEach(file => {
    fs.unlink(file, (err) => {
      if (err) {
        console.error(`Error deleting file ${file}: ${err}`);
      } else {
        console.log(`File ${file} deleted successfully`);
      }
    });
  });
}

app.use(function(req, res, next) {
  res.status(404);

  // redirect to custom error page
  res.render('errorpage');
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
