//All middleware goes here
var Unit				= require("../models/unit");
var Task 				= require("../models/task");
var User				= require("../models/user");
var Feedback			= require("../models/feedback");
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please login first");
	res.redirect("/");
}

module.exports = middlewareObj;