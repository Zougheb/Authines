var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    Cuisine     = require ("./models/cuisine"),
    Comment        = require ("./models/comment"),
    User           = require("./models/user"),
    PORT           = process.env.PORT || 8081,
    seedDB         = require ("./seeds");
 
// requiring routes
var commentRoutes    = require("./routes/comments"),
    cuisineRoutes = require("./routes/cuisines"),
    indexRoutes      = require("./routes/index");
    
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/food_world_app", {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // seed the database

// Use moment.js
app.locals.moment = require('moment');

// PASSPORT CONFIG
app.use(require("express-session")({
   secret:" Nala is the Best",
   resave: false,
   saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
   next();
});

app.use(indexRoutes);
app.use(cuisineRoutes);
app.use(commentRoutes);

app.listen(PORT, function(){
    console.log("APP Listening on PORT: " + PORT);
});