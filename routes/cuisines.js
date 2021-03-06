var express    = require("express");
var router     = express.Router();
var Cuisine = require("../models/cuisine");
var middleware = require("../middleware");
var geocoder = require("geocoder");

// INDEX ROUTE -- SHOW ALL CUISINES
router.get("/cuisines", function(req, res){
    // Get all cuisines from the DB
    Cuisine.find({}, function(err, allCuisines){
        if(err){
            console.log(err);
        } else {
             res.render("cuisines/index", {cuisines: allCuisines, page: "cuisines"});
        }
    });
});

// CREATE -- ADD NEW CUISINE TO DB
router.post("/cuisines",middleware.isLoggedIn, function(req,res){
    // get data from form and add to data array
    var name       = req.body.name;
    var image      = req.body.image;
    var desc       = req.body.description;
    var author     = {
                        id: req.user._id,
                        username: req.user.username
                     }
    var cost       = req.body.cost;
  geocoder.geocode(req.body.location, function (err, data) {
    var lat        = data.results[0].geometry.location.lat;
    var lng        = data.results[0].geometry.location.lng;
    var location   = data.results[0].formatted_address;
    var newCuisine = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
    // Create a new cuisine and save to DB
    Cuisine.create(newCuisine, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to cuisines page
            console.log(newlyCreated);
            res.redirect("/cuisines");
        }
    });
  });
});

// NEW -- SHOW FORM TO CREATE NEW CUISINES
     router.get("/cuisines/new",middleware.isLoggedIn, function(req, res){
         res.render("cuisines/new");
         
});

// SHOW - show more info about one cuisine
router.get("/cuisines/:id", function(req, res){
    // find the cuisine with provided ID
    Cuisine.findById(req.params.id).populate("comments").exec(function(err, foundCuisine){
        if(err || !foundCuisine){
            req.flash("error", "Cuisine not found");
            res.redirect("back");
        } else{
            // render show template with that cuisine
            res.render("cuisines/show", {cuisine: foundCuisine});
        }
    });
    
});

// EDIT CUISINE ROUTE
router.get("/cuisines/:id/edit", middleware.checkCuisineOwnership, function(req, res){
    Cuisine.findById(req.params.id, function(err, foundCuisine){
        res.render("cuisines/edit", {cuisine: foundCuisine});
    });
});


// UPDATE CUISINE ROUTE
router.put("/cuisines/:id", function(req, res){
    geocoder.geocode(req.body.cuisine.location, function (err, data) {
    if(err) {
    console.log('Error', err.message);
    console.log('Data', data);
    req.flash('error', err.message);
    return res.redirect('back');
    }
  console.log(data);
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.cuisine.name, image: req.body.cuisine.image, description: req.body.cuisine.description, cost: req.body.cuisine.cost, location: location, lat: lat, lng: lng};
    Cuisine.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, cuisine){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/cuisines/" + cuisine._id);
        }
    });
  });
});

// DESTROY CUISINE ROUTES
router.delete("/cuisines/:id", middleware.checkCuisineOwnership, function(req, res){
    Cuisine.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/cuisines");
      } else {
          res.redirect("/cuisines");
      }
   });
});

// middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function checkCuisineOwnership(req, res, next){
    // is user logged in?
       if(req.isAuthenticated()){
           Cuisine.findById(req.params.id, function(err,foundCuisine){
                if(err){
            res.redirect("/cuisines");
       } else{
             //   does the user own the cuisine?
            if(foundCuisine.author.id.equals(req.user._id)) {
                next();
            } else{
                res.redirect("back");
            }
          }
        });
         } else{
            res.redirect("back");
        }
}

module.exports = router;