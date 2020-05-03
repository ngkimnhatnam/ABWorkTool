var express 			= require("express"),
	router 				= express.Router(),
	passport			= require("passport"),
	nodemailer			= require("nodemailer"),
	moment				= require("moment"),
	expressSanitizer 	= require("express-sanitizer"),
	mongoClient 		= require('mongodb').MongoClient,
	displayTime 		= moment().format("ddd DD MMM YYYY"),
	Unit				= require("../models/unit"),
	Task 				= require("../models/task"),
	User				= require("../models/user"),
	Feedback			= require("../models/feedback"),
	// url 				= "mongodb://localhost",  
	// dbName 				= "airbnb",
	url					= "mongodb+srv://ngkimnhatnam:Nhatnam92@airbnbworktoolcluster-lkprs.mongodb.net",
	dbName				= "airbnbworktool",
	thisMoment 			= new Date(),
	minDate 			= moment().format("YYYY-MM-DD"),
	middleware			= require("../middleware/index");
	thisMoment.setHours(0,0,0,0);

//Landing page
router.get("/", function(req,res){
	res.render("landing");
})

//===========
//AUTH ROUTES
//===========

//To REGISTER route
router.get("/register", function(req,res){
	res.render("register");
})

//Create new USER then redirects
router.post("/register", function(req,res){
	req.body.username = req.sanitize(req.body.username)
	req.body.nickname = req.sanitize(req.body.nickname)	
	req.body.password = req.sanitize(req.body.password)
	
	if(req.body.manager==="on" && req.body.master==="master123"){
		var newUser = new User({username: req.body.username,nickname: req.body.nickname, isManager: true});
	}else {
		var newUser = new User({username: req.body.username,nickname: req.body.nickname, isManager: false});
	}
	if(!req.body.password){
		req.flash("error", "Password cannot be empty");
		res.redirect("back");
	}else {
		//Create new user and adds to DB
		User.register(newUser, req.body.password,function(err,newlyCreatedUser){
			if(err){
				req.flash("error", err.message);
				res.redirect("back");
			}else {
				passport.authenticate("local")(req,res,function(){
				req.flash("success", "Account successfully created");
				res.redirect("/");
				})
				
				const Email = require('email-templates');
				const email = new Email({
					// uncomment below to send emails in development/test env:
					send: true,
					transport: {
						service: "gmail",
						auth: {
						user: 'abworktool@gmail.com',
						pass: 'Nhatnam92'
						}
					}
				});

				email
				.send({
				template: 'accountCreation',
				message: {
					from: 'abworktool@gmail.com',
					to: req.body.username
				},
					locals: {
						username: req.body.username,
						nickname: req.body.nickname,
						password: req.body.password,
						link:	'https://arcane-tundra-61659.herokuapp.com/'
					}
				})
				.then(console.log)
				.catch(console.error);	
			}		
		});
	}
})

//This route handles login
router.post("/login", passport.authenticate("local", 
	{
	successRedirect: "/task",
	failureRedirect: "/",
	badRequestMessage : "Wrong username or password.",
	failureFlash: true
	}),
	function(req,res){
		
})	

//logout route
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "Logged out successfully");
	res.redirect("/");
})

//========================
//PASSWORD RELATED ROUTES
//========================

//SHOW PASSWORD RETRIEVAL
router.get("/reclaim_password",function(req,res){
	res.render("reclaimPassword");
});

//POST PW RETRIEVAL
router.post("/reclaim_password", function(req,res){
	req.body.username = req.sanitize(req.body.username)
	User.find({}, function(err,allUsers){
		allUsers.forEach(function(user){
			if(user.username===req.body.username){
				const Email = require('email-templates');
				const email = new Email({

				  // uncomment below to send emails in development/test env:
				  send: true,
				  transport: {
					service: "gmail",
					auth: {
					user: 'abworktool@gmail.com',
					pass: 'Nhatnam92'
					}
				  }
				});

				email
				  .send({
					template: 'resetPass',
					message: {
						from: 'abworktool@gmail.com',
						to: req.body.username
						
					},
					locals: {
						nickname: user.nickname,
						link:	'https://arcane-tundra-61659.herokuapp.com/reset_password/'+user._id
					}
				  })
				  .then(console.log)
				  .catch(console.error);	
				
				req.flash("success", "Password reset confirmation sent to your email.");
				res.redirect("/");
			}else {
				req.flash("error", "No username found");
				res.redirect("back");
			}
		})
	});
})

//PASSWORD RESET FORM
router.get("/reset_password/:id", function(req,res){
	
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error", "Error finding user");
			res.redirect("back");
		}else {
			res.render("resetPassword", {user: foundUser});
		}
	})
})

//PASSWORD RESET
router.put("/reset_password/:id", function(req,res){
	req.body.password	= req.sanitize(req.body.password)
	req.body.retype		= req.sanitize(req.body.retype)
	if(req.body.password !== req.body.retype){
		req.flash("error", "Confirming password doesn't match");
		res.redirect("/reset_password/"+req.params.id);
	}else {
		if(!req.body.password){
			req.flash("error", "Password cannot be empty");
			res.redirect("back");
		}else {
			User.findById(req.params.id,function(err, updatedUser){
			if(err){
				req.flash("error", "Error finding user");
				res.redirect("back");
				console.log(err);
			}else {
				updatedUser.setPassword(req.body.password, function(){
					updatedUser.save();	
				})
				req.flash("success","You reset password successfully!");
				res.redirect("/");
			}
			})	
		}
		
	}
})
	
//CHANGE PASSWORD FORM
router.get("/change_password/:id", function(req,res){
	
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error", "Error finding user");
			res.redirect("back");
		}else {
			res.render("settings/pwchange", {user: foundUser, date: displayTime});
		}
	})
})

//CHANGE PASSWORD UPDATE
router.put("/change_password/:id", function(req,res){
	req.body.password	= req.sanitize(req.body.password)
	req.body.retype		= req.sanitize(req.body.retype)
	
	if(req.body.password !== req.body.retype){
		req.flash("error", "Confirming password doesn't match");
		res.redirect("/change_password/"+req.params.id);
	}else {
		if(!req.body.password){
			req.flash("error", "Password cannot be empty");
			res.redirect("back");
		}else {
			User.findById(req.params.id,function(err, updatedUser){
			if(err){
				req.flash("error", "Error finding user");
				res.redirect("back");
			}else {
				updatedUser.setPassword(req.body.password, function(){
					updatedUser.save();	
				})
				req.flash("success", "Password changed successfully");
				res.redirect("/task");
			}
		})	
		}
		
	}
})

//====================
//SORTING ROUTES
//====================

//SORT OPTION FORM
router.get("/sort_option",middleware.isLoggedIn, function(req,res){
	
	Unit.find({}, function(err, allUnits){
		if(err){
			req.flash("error", "Error finding units");
			res.redirect("back");
		}else {
			User.find({}, function(err, allUsers){
				if(err){
					req.flash("error", "Error finding users");
					res.redirect("back");
				}else {
					res.render("settings/sortoption", {units: allUnits, users: allUsers, date: displayTime,user: req.user});
				}
			})
		}
	});

})

//SORT OPTION USER
router.get("/sort_option/user/:id",middleware.isLoggedIn, function(req,res){
	
	var currentTasksArray = [];
	var taskPerUserArray = [];
	
	User.findById(req.params.id, function(err,foundUser){
		if(err){
			req.flash("error", "Error finding user");
			res.redirect("back");
		}else {
			mongoClient.connect(url, function(err, client) {  
				if(err){throw err;}
				var db	= client.db(dbName);
					var mysort = { date: 1 };	db.collection("tasks").find().sort(mysort).toArray(function(err, result){
						if (err){
							throw err;
						}else {
							result.forEach(function(task){
								task.date.setHours(0,0,0,0);
								if(task.date.getTime()>= thisMoment.getTime()){
									task.date = moment(task.date).format("ddd DD MMM YYYY");
									currentTasksArray.push(task);
								}								
							})
							currentTasksArray.forEach(function(task){
								if(foundUser._id.toString() === task.user.id.toString()){
									taskPerUserArray.push(task);	
								}
							})
							if(req.user.isManager){
								res.render("tasks/index", {tasks: taskPerUserArray, date: displayTime, user: req.user});
							}
						} 	
						client.close();
					});
			});
		}
	})
})

//SORT OPTION UNIT
router.get("/sort_option/unit/:id",middleware.isLoggedIn, function(req,res){
	var currentTasksArray = [];
	var taskPerUnitArray = [];
	
	Unit.findById(req.params.id, function(err,foundUnit){
		if(err){
			req.flash("error", "Error finding unit");
			res.redirect("back");
		}else {
			mongoClient.connect(url, function(err, client) {  
				if(err){throw err;}
				var db	= client.db(dbName);
					var mysort = { date: 1 };
					db.collection("tasks").find().sort(mysort).toArray(function(err, result){
						if (err){
							throw err;
						}else {
							result.forEach(function(task){
								task.date.setHours(0,0,0,0);
								if(task.date.getTime()>= thisMoment.getTime()){
									task.date = moment(task.date).format("ddd DD MMM YYYY");
									currentTasksArray.push(task);
								}								
							})
							currentTasksArray.forEach(function(task){
								task.unit.forEach(function(singleUnitObject){
									if(foundUnit.name === singleUnitObject.name){
										taskPerUnitArray.push(task);	
									}
								})
							})
							if(req.user.isManager){
								res.render("tasks/index", {tasks: taskPerUnitArray, date: displayTime, user: req.user});
							}
						} 	
						client.close();
					});
			});
		}
	})
})

function viewHistory(number,req,res){
	var taskArray = [];
	var newArray = [];
	var toCurrent = {
		route: "/task",
		name: "Current Tasks"
	}
	mongoClient.connect(url, function(err, client) {  
		if(err){
			req.flash("error", "Error connecting database");
			res.redirect("back");
			throw err;  
		}
		var db	= client.db(dbName);
		var mysort = { date: 1 };
  		db.collection("tasks").find().sort(mysort).toArray(function(err, result){
    		if (err){
				throw err;
			}else {
				result.forEach(function(task){
					task.date.setHours(0,0,0,0);
					if((thisMoment.getTime()-task.date.getTime())/(1000*3600*24)<number&&task.date.getTime() < thisMoment.getTime()){
						task.date = moment(task.date).format("ddd DD MMM");
						newArray.push(task);
					}		
				})
				if(req.user.isManager){
					res.render("tasks/history", {tasks: newArray, date: displayTime, route: toCurrent, user: req.user, dateNow: thisMoment});
				}else {
					newArray.forEach(function(task){
						if(task.user.id.toString() === req.user._id.toString()){
							taskArray.push(task);
						}
					})
					res.render("tasks/history", {tasks: taskArray, date: displayTime, route: toCurrent,user: req.user, dateNow: thisMoment});
				}
			} 	
    		client.close();
  		});
	}); 
}

//HISTORY ROUTE
router.get("/history",middleware.isLoggedIn, function(req,res){
	viewHistory(30,req,res);
})

//HISTORY 90
router.get("/history_90",middleware.isLoggedIn, function(req,res){
	viewHistory(90,req,res);
})

//HISTORY 180
router.get("/history_180",middleware.isLoggedIn, function(req,res){
	viewHistory(180,req,res);
})


module.exports 	= router;




