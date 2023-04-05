const express = require("express");
const app = express();
const path = require("path");
const {connectMongoose, User} = require("./database.js");
const passport = require("passport");
const { initializingPassport, isAuthenticated } = require("./passportConfig.js");
const expressSession = require("express-session");
const hbs = require("hbs");

connectMongoose();

initializingPassport(passport);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '../')));
app.use(expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../html"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../html/HomePage.html'));
});

app.get("/SignUp", (req, res) => {
    res.sendFile(path.join(__dirname, "../html/SignUp.html"));
});

app.get("/Login", (req, res) => {
    res.sendFile(path.join(__dirname, "../html/login.html"));
});

app.post("/SignUp", async (req, res) => {
    const user = await User.findOne({username: req.body.username});
    if (user) return res.status(400).send("User already exists!");
    req.body.joinDate = new Date();
    const newUser = await User.create(req.body);
    res.redirect('/Profile/' + newUser.username.slice(0, newUser.username.indexOf('@')));
});

app.post("/Login", passport.authenticate("local", {failureRedirect: "/Login"}), (req, res) => {
    res.redirect('/Profile/' + req.user.username.slice(0, req.user.username.indexOf('@')));
});

app.get("/Profile/*", isAuthenticated, (req, res) => {
    res.render("Profile", req.user);
});

app.get("/Logout", (req, res, done) => {
    req.logOut((err) => {
        if (err) return done(err);
    res.redirect("/");
    });
});

app.post("/html/pdf.html", (req, res) => {
    res.redirect("/html/pdf.html");
});



app.listen(3000, () => {
    console.log("listening on 3000");
});