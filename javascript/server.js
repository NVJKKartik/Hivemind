const express = require("express");
const app = express();
const path = require("path");
const {connectMongoose, User} = require("./database.js");
const passport = require("passport");
const { initializingPassport } = require("./passportConfig.js");
const expressSession = require("express-session");

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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../html/HomePage.html'));
});

app.get("/SignUp", (req, res) => {
    res.sendFile(path.join(__dirname, "../html/SignUp.html"))
});

app.post("/SignUp", async (req, res) => {
    const user = await User.findOne({username: req.body.username});
    if (user) return res.status(400).send("User already exists!");
    const newUser = await User.create(req.body);
    res.redirect('/users/' + newUser.username);
});

app.listen(3000, () => {
    console.log("listening on 3000");
});