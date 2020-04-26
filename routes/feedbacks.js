var express 			= require("express");
var router 				= express.Router({mergeParams: true});
var Task 				= require("../models/task");
var Feedback			= require("../models/feedback");
var Unit				= require("../models/unit");
var User				= require("../models/user");
var moment				= require("moment");
var displayTime 		= moment().format("ddd DD MMM YYYY");
var middleware			= require("../middleware/index");


//FEEDBACK FORM
router.get("/",middleware.isLoggedIn, function(req,res){
	
	Task.findById(req.params.id, function(err,foundTask){
		if(err){
			console.log(err);
		}else {
			res.render("tasks/feedback", {task: foundTask, date: displayTime});
		}
	})
})

//FEEDBACK SUBMIT
router.post("/",middleware.isLoggedIn, function(req,res){
	Task.findById(req.params.id, function(err,foundTask){
		if(err){
			console.log(err);
		}else {
			Feedback.create(req.body.feedback, function(err, createdFeedback){
				if(err){
					console.log(err);
				}else {
					createdFeedback.content = req.body.feedback.text;
					createdFeedback.author = {
						id: req.user.id,
						nickname: req.user.nickname
					}
					createdFeedback.save();
					foundTask.feedback.push(createdFeedback);
					foundTask.save();
					req.flash("success", "Feedback submitted");
					res.redirect("/task/"+foundTask._id);
				}
			})
		}
	})
})

module.exports 	= router;







