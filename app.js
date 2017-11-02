var express          = require("express"),
    app              = express(),
    expressSanitizer = require("express-sanitizer"),
    methodOverride   = require("method-override"),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    PORT             = process.env.PORT || 8080;


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


app.get("/", function(req, res){
  res.redirect("/meals");
});

// INDEX ROUTE
app.get("/meals", function(req, res){
  // RETRIEVE ALL THE MEALS FROM THE DB
  Meal.find({}, function(err, meals){
    if(err){
      console.log("ERROR");
    } else{
      res.render("index", {meals: meals});
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


app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});