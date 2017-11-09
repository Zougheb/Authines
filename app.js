var express          = require("express"),
    app              = express(),
    expressSanitizer = require("express-sanitizer"),
    methodOverride   = require("method-override"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    User             = require("./models/user"),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    PORT             = process.env.PORT || 8081;


// APP CONFIG
mongoose.connect("mongodb://localhost/food_world_app",{useMongoClient: true});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var mealSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Meal = mongoose.model("Meal", mealSchema);

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
   next();
});


app.get("/", function(req, res){
  res.render("landing")
})


// INDEX ROUTE
app.get("/meals", function(req, res){
  // RETRIEVE ALL THE MEALS FROM THE DB
  Meal.find({}, function(err, meals){
    if(err){
      console.log("ERROR");
    } else{
      res.render("index", {meals:meals, currentUser: req.user});
    }
  }); 
});

// NEW ROUTE
app.get("/meals/new", function(req,res){
  res.render("new");
});

// CREATE ROUTE
app.post("/meals", function(req, res){
  // create meal
  // req.body.meal.body = req.sanitizer(req.body.meal.body);
  Meal.create(req.body.meal, function(err, newMeal){
    if(err){
      res.render("new");
    } else{
       // then, redirect to the index
      res.redirect("/meals");
    }
  });
});
// SHOW ROUTE
app.get("/meals/:id", function(req, res){
  Meal.findById(req.params.id, function(err, foundMeal){
    if(err){
      res.redirect("/meals");
    } else {
      res.render("show", {meal: foundMeal});
    }
  });
});

// EDIT ROUTE
app.get("/meals/:id/edit", function(req, res){
   Meal.findById(req.params.id, function(err, foundMeal){
       if(err){
           console.log(err);
           res.redirect("/meals");
       } else {
           res.render("edit", {meal: foundMeal});
       }
   });
});

// UPDATE ROUTE
app.put("/meals/:id", function(req, res){
  req.body.meal.body = req.sanitize(req.body.meal.body);
  Meal.findByIdAndUpdate(req.params.id, req.body.meal, function(err, updtedMeal){
       if(err){
           res.redirect("/meals");
       } else {
         res.redirect("/meals/" + req.params.id);
         
       }
   });
});

// DELETE ROUTE
app.delete("/meals/:id", function(req, res){
  // DESTROY MEAL
   Meal.findByIdAndRemove(req.params.id, function(err, Meal){
       if(err){
           res.redirect("/meals");
       } else {
           res.redirect("/meals");
       }
   }); 
});

// ================
// AUTH ROUTES
// ================

// SHOW REGISTER FORM
app.get("/register", function(req, res){
    res.render("signup");
});
// Handle Sign Up Logic
app.post("/register", function(req, res){
    // res.send("Signing you up!!");
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password,function(err, user){
        if(err){
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/meals");
        });
    });
});

// SHOW LOGIN FORM
app.get("/login", function(req, res){
    res.render("login");
});
// handling login logic
app.post("/login", passport.authenticate("local",
     {
         successRedirect: "/meals",
         failureRedirect: "/login"
}), function(req, res){
});

// LOGOUT ROUTES AND LOGIC
app.get("/logout", function(req, res){
    req.logout();
    res.render("landing");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});