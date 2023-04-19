const express = require("express");
const app = express();
const path = require("path");
const { connectMongoose, User, pdfSchema } = require("./database.js");
const passport = require("passport");
const {
  initializingPassport,
  isAuthenticated,
} = require("./passportConfig.js");
const expressSession = require("express-session");
const hbs = require("hbs");
const ejs = require("ejs");
const fs = require("fs");
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
var upload = multer({ storage: storage })

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
  res.sendFile(path.join(__dirname, "../html/HomePage.html"));
});

app.get("/SignUp", (req, res) => {
  res.sendFile(path.join(__dirname, "../html/SignUp.html"));
});

app.get("/Login", (req, res) => {
  res.sendFile(path.join(__dirname, "../html/login.html"));
});

app.post("/SignUp", upload.single('img'), async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send("User already exists!");
  const newUser = await User.create({
    name: req.body.name,
    img: fs.readFileSync("uploads/" + req.file.filename),
    joinDate: new Date(),
    username: req.body.username,
    password: req.body.password
  });

  res.redirect("/Profile");
});

app.post("/html/PdfViewer.ejs", upload.single('myPdf'), async (req, res) => {
    try {
        const pdf = fs.readFileSync(req.file.path);
        const encode_pdf = pdf.toString('base64');
        const final_pdf = {
            contentType: req.file.mimetype,
            pdf: new Buffer.from(encode_pdf, 'base64'),
        };
        const result = await pdfSchema.create(final_pdf);
        console.log(result.pdf.buffer);
        console.log("Saved PDF to database");

        res.redirect(`/pdf/${result._id}`);
        
    } catch (err) {
        console.log(err);
        res.status(500).send("Failed to save PDF to database");
    }
});

app.get('/pdf/:pdfId', async (req, res) => {
  try {
      const pdf = await pdfSchema.findById(req.params.pdfId);
      res.render("PdfViewer", { pdf });
  } catch (err) {
      console.log(err);
      res.status(500).send("Failed to display PDF from database");
  }
});

app.get('/PdfViewer', (req, res) => {
  res.render('PdfViewer', { pdfId: req.query.id });
});

 
app.post(
  "/Login",
  passport.authenticate("local", { failureRedirect: "/Login" }),
  (req, res) => {
    res.redirect("/Profile");
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

app.get("/Dashboard", isAuthenticated, (req, res) => {
  res.redirect("/html/Dashboard.hbs", req.user);
});

app.post("/html/pdf.html", (req, res) => {
  res.redirect("/html/pdf.html");
});

app.get("/Settings", isAuthenticated, (req, res) => {
  res.render("Settings", req.user);
});

app.post("/Settings", (req, res) => {
  update(req, res);
  res.redirect("/Profile");
});

async function update(req, res) {
    await User.updateOne({username: req.user.username}, req.body);
    await req.user.save();
}

app.listen(3000, () => {
  console.log("listening on 3000");
});
