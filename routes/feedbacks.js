var express 			= require("express"),
	router 				= express.Router({mergeParams: true}),
	Task 				= require("../models/task"),
	Feedback			= require("../models/feedback"),
	Unit				= require("../models/unit"),
	User				= require("../models/user"),
	moment				= require("moment"),
	expressSanitizer 	= require("express-sanitizer"),
	displayTime 		= moment().format("ddd DD MMM YYYY"),
	middleware			= require("../middleware/index");


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
			req.flash("error", "Error finding task");
			res.redirect("back");
			console.log(err);
		}else {
			req.body.feedback.text = req.sanitize(req.body.feedback.text)
			Feedback.create(req.body.feedback, function(err, createdFeedback){
				if(err){
					req.flash("error", "Error posting feedback");
					res.redirect("back");
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







