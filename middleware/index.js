var Cuisine = require("../models/cuisine");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkCuisineOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Cuisine.findById(req.params.id, function(err, foundCuisine){
           if(err || !foundCuisine){
               req.flash("error", "Cuisine not found");
               res.redirect("back");
           }  else {
               // does user own the cuisine?
            if(foundCuisine.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You don't have permission to do that!!");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err || !foundComment){
               req.flash("error", "Comment not found");
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id) ||req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that!!");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in first to do that!!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that!!");
    res.redirect("/login");
}

module.exports = middlewareObj;