var express 		= require("express"),
	bodyParser 		= require("body-parser"),
	mongoose		= require("mongoose"),
	passport		= require("passport"),
	localStrategy	= require("passport-local"),
	User			= require("./models/user"),
	Unit			= require("./models/unit"),
	Task			= require("./models/task"),
	Feedback		= require("./models/feedback"),
	methodOverride	= require("method-override"),
	moment			= require("moment"),
	nodemailer		= require("nodemailer"),
	app 			= express();
	

var thisMoment = new Date();
thisMoment.setHours(0,0,0,0);
var minDate = moment().format("YYYY-MM-DD");
var now = moment().format("ddd DD MMM YYYY");
 
var mongoClient = require('mongodb').MongoClient;  
var url = "mongodb://localhost";  
var dbName 	= "airbnb";
var sortMethod = "date";
 
mongoose.connect("mongodb://localhost/airbnb",{ useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret:"Piu is super kute",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//This function calls on every route, passing req.user as parameter to check
//if user is empty or logged in, then next() proceeds to following route call
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

//Landing page
app.get("/", function(req,res){
	res.render("landing");
})

//INDEX TASK
app.get("/task",isLoggedIn, function(req,res){
	var taskArray = [];
	var newArray = [];
	
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
							newArray.push(task);
						}		
					})
					if(req.user.isManager){
						res.render("tasks/index", {tasks: newArray, date: now, user: req.user});
					}else {
						newArray.forEach(function(task){
							if(task.user.id.toString() === req.user._id.toString()){
								taskArray.push(task);
							}
						})
						res.render("tasks/index", {tasks: taskArray, date: now,user: req.user});
					}
				} 	
				//console.log(result);
				client.close();
			});
	}); 
})

//SORT OPTION USER
app.get("/sort_option/user/:id", function(req,res){
	
	var currentTasksArray = [];
	var taskPerUserArray = [];
	
	User.findById(req.params.id, function(err,foundUser){
		if(err){
			console.log(err);
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
								res.render("tasks/index", {tasks: taskPerUserArray, date: now, user: req.user});
							}
						} 	
						client.close();
					});
			});
		}
	})
})

//SORT OPTION UNIT
app.get("/sort_option/unit/:id", function(req,res){
	var currentTasksArray = [];
	var taskPerUnitArray = [];
	
	Unit.findById(req.params.id, function(err,foundUnit){
		if(err){
			console.log(err);
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
								task.unit.forEach(function(unitName){
									if(foundUnit.name === unitName){
										taskPerUnitArray.push(task);	
									}
								})
							})
							if(req.user.isManager){
								res.render("tasks/index", {tasks: taskPerUnitArray, date: now, user: req.user});
							}
						} 	
						client.close();
					});
			});
		}
	})
})

//NEW TASK
app.get("/task/new",isLoggedIn, function(req,res){
	Unit.find({}, function(err, allUnits){
		if(err){
			console.log(err);
		}else {
			User.find({}, function(err, allUsers){
				if(err){
					console.log(err);
				}else {
					//console.log(allUsers);
					res.render("tasks/new", {units: allUnits, users: allUsers, date: now, thisMoment: minDate});
				}
			})
		}
	});
})

//CREATE TASK
app.post("/task", function(req,res){
	var newTask;
	User.findById(req.body.user, function(err, foundUser){
		if(err){
			console.log(err);
		}else {
			var assignedWorker = {
				id: foundUser._id,
				nickname: foundUser.nickname
			}
			newTask = {date: req.body.date, user: assignedWorker, unit: req.body.unit, sidenote: req.body.sidenote};
			//Create new tasks and adds to DB
			Task.create(newTask,function(err, newlyCreatedTask){
				if(err){
					console.log(err);

				}else {
					res.redirect("/task");
				}
			})
		}
	})
})

//SHOW TASK
app.get("/task/:id", function(req,res){
	
	Task.findById(req.params.id).populate("feedback").exec(function(err, foundTask){
		if(err){
			console.log(err);
		}else {
			res.render("tasks/show", {task: foundTask, date: now});
		}
	})
})

//EDIT TASK
app.get("/task/:id/edit", function(req,res){
	var unitList = [];
	var userList = [];
	Unit.find({}, function(err,allUnits){
		if(err){
			console.log(err);
		}else {
			unitList = allUnits;
		}
	})
	User.find({}, function(err,allUsers){
		if(err){
			console.log(err);
		}else {
			userList = allUsers;
		}
	})
	Task.findById(req.params.id, function(err,foundTask){
		if(err){
			console.log(err);
		}else {
			console.log(foundTask);
			res.render("tasks/edit", {task: foundTask, units: unitList, users: userList, date: now, thisMoment: minDate});
		}
	})
})

//UPDATE TASK
app.put("/task/:id", function(req,res){
	
	User.findById(req.body.user, function(err, foundUser){
		if(err){
			console.log(err);
		}else {
			var assignedWorker = {
				id: foundUser._id,
				nickname: foundUser.nickname
			}
			var newTask = {date: req.body.date, user: assignedWorker, unit: req.body.unit, sidenote: req.body.sidenote};
			Task.findByIdAndUpdate(req.params.id, newTask,function(err, updatedTask){
				if(err){
					res.redirect("/task");
				}else {
					res.redirect("/task/"+req.params.id);
				}
			})
		}
	})
	
})


//DELETE TASK
app.delete("/task/:id", function(req,res){
	Task.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
		}else {
			res.redirect("/task");
		}
	})
})

//INDEX UNIT
app.get("/unit",isLoggedIn, function(req,res){
	var toUnit = {
		route: "/unit/new",
		name: "new unit"
	};
	Unit.find({}, function(err, allUnits){
		if(err){
			console.log(err);
		}else {
			res.render("units/", {units: allUnits, date: now, route: toUnit});
		}
	});
})

//NEW UNIT
app.get("/unit/new", function(req,res){
	res.render("units/new", {date: now});
})

//CREATE UNIT
app.post("/unit", function(req,res){
	var newUnit = {name: req.body.name,image: req.body.image, checkinout: req.body.checkinout};
	
	//Create new units and adds to DB
	Unit.create(newUnit,function(err, newlyCreatedUnit){
		if(err){
			console.log(err);
			
		}else {
			res.redirect("/unit");
		}
	})
})

//SHOW UNIT
app.get("/unit/:id", function(req,res){
	Unit.findById(req.params.id, function(err, foundUnit){
		if(err){
			console.log(err);
		}else {
			res.render("units/show", {unit: foundUnit, date: now});
		}
	})
})

//EDIT UNIT 
app.get("/unit/:id/edit", function(req,res){
	Unit.findById(req.params.id, function(err, foundUnit){
		if(err){
			console.log(err);
		}else {
			res.render("units/edit", {unit: foundUnit, date: now});
		}
	})
})

//UPDATE UNIT
app.put("/unit/:id",function(req,res){
	Unit.findByIdAndUpdate(req.params.id,req.body.unit, function(err,updatedUnit){
		if(err){
			res.redirect("/unit");
		}else {
			res.redirect("/unit/"+req.params.id);
		}
	})
})

//DELETE UNIT
app.delete("/unit/:id", function(req,res){
	Unit.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
		}else {
			res.redirect("/unit");
		}
	})
})

//To REGISTER route
app.get("/register", function(req,res){
	res.render("register");
})

//Create new USER then redirects
app.post("/register", function(req,res){
	if(req.body.manager==="on" && req.body.master==="master123"){
		var newUser = new User({username: req.body.username,nickname: req.body.nickname, isManager: true});
	}else {
		var newUser = new User({username: req.body.username,nickname: req.body.nickname, isManager: false});
	}	
	//Create new user and adds to DB
	User.register(newUser, req.body.password,function(err,newlyCreatedUser){
		if(err){
			console.log(err);
			return res.render("/register");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/task");
		})
	});
})

//This route handles login
app.post("/login", passport.authenticate("local", 
	{
	successRedirect: "/task",
	failureRedirect: "/"
	}),
	function(req,res){
})	

//logout route
app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/");
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
					res.render("tasks/history", {tasks: newArray, date: now, route: toCurrent, user: req.user});
				}else {
					newArray.forEach(function(task){
						if(task.user.id.toString() === req.user._id.toString()){
							taskArray.push(task);
						}
					})
					res.render("tasks/history", {tasks: taskArray, date: now, route: toCurrent,user: req.user});
				}
			} 	
    		client.close();
  		});
	}); 
}

//HISTORY ROUTE
app.get("/history",isLoggedIn, function(req,res){
	viewHistory(30,req,res);
})

//HISTORY 90
app.get("/history_90",isLoggedIn, function(req,res){
	viewHistory(90,req,res);
})

//HISTORY 180
app.get("/history_180",isLoggedIn, function(req,res){
	viewHistory(180,req,res);
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		//console.log(req.user);
		return next();
	}
	res.redirect("/");
}

//SHOW PASSWORD RETRIEVAL
app.get("/reclaim_password",function(req,res){
	res.render("reclaimPassword");
});

//POST PW RETRIEVAL
app.post("/reclaim_password", function(req,res){
	var myMail = "celestialrailroad@gmail.com";
	
	// host: 'smtp.mailtrap.io',
	// 				port: 2525,
	// 				auth: {
	// 				user: '48aabd7aa3cb7c',
	// 				pass: '21881e8e51e9d6'
	
	User.find({}, function(err,allUsers){
		allUsers.forEach(function(user){
			if(user.username===req.body.username){
				// let transport = nodemailer.createTransport({
				// 	// service: "gmail",
				// 	// auth: {
				// 	// user: 'ngkimnhatnam@gmail.com',
				// 	// pass: 'Ngkimnhatnam92'
				// 	// }
				// 	host: 'smtp.mailtrap.io',
				// 	port: 2525,
				// 	auth: {
				// 	user: '48aabd7aa3cb7c',
				// 	pass: '21881e8e51e9d6'}
				// })
				
				const Email = require('email-templates');

				const email = new Email({

				  // uncomment below to send emails in development/test env:
				  send: true,
				  transport: {
					host: 'smtp.mailtrap.io',
					port: 2525,
					auth: {
					user: '48aabd7aa3cb7c',
					pass: '21881e8e51e9d6'}
				  }
				});

				email
				  .send({
					template: 'resetPass',
					message: {
						from: 'myemail@gmail.com',
						to: 'youremail@gmail.com'
						
					},
					locals: {
						nickname: user.nickname,
						link:	'https://piupiu.run-eu-central1.goorm.io/reset_password/'+user._id
					}
				  })
				  .then(console.log)
				  .catch(console.error);		
			}
		})
	});
})

//PASSWORD RESET FORM
app.get("/reset_password/:id", function(req,res){
	
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			console.log(err);
		}else {
			console.log(foundUser);
			res.render("resetPassword", {user: foundUser});
		}
	})
})

//PASSWORD RESET
app.put("/reset_password/:id", function(req,res){
	
	if(req.body.password !== req.body.retype){
		res.redirect("/reset_password/"+req.params.id);
	}else {
		
		User.findById(req.params.id,function(err, updatedUser){
			if(err){
				console.log(err);
			}else {
				updatedUser.setPassword(req.body.password, function(){
					updatedUser.save();	
				})
				res.send("You reset password successfully!");
			}
		})	
	}
})
	
//CHANGE PASSWORD FORM
app.get("/change_password/:id", function(req,res){
	
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			console.log(err);
		}else {
			console.log(foundUser);
			res.render("settings/pwchange", {user: foundUser, date: now});
		}
	})
})

//CHANGE PASSWORD UPDATE
app.put("/change_password/:id", function(req,res){
	
	if(req.body.password !== req.body.retype){
		res.redirect("/change_password/"+req.params.id);
	}else {
		
		User.findById(req.params.id,function(err, updatedUser){
			if(err){
				console.log(err);
			}else {
				updatedUser.setPassword(req.body.password, function(){
					updatedUser.save();	
				})
				//res.send("You reset password successfully!");
				res.redirect("/task");
			}
		})	
	}
})

//SORT OPTION FORM
app.get("/sort_option", function(req,res){
	
	Unit.find({}, function(err, allUnits){
		if(err){
			console.log(err);
		}else {
			User.find({}, function(err, allUsers){
				if(err){
					console.log(err);
				}else {
					//console.log(allUsers);
					res.render("settings/sortoption", {units: allUnits, users: allUsers, date: now});
				}
			})
		}
	});

})

//FEEDBACK FORM
app.get("/task/:id/feedback", function(req,res){
	
	Task.findById(req.params.id, function(err,foundTask){
		if(err){
			console.log(err);
		}else {
			res.render("tasks/feedback", {task: foundTask, date: now});
		}
	})
	
	
})

//FEEDBACK SUBMIT
app.post("/task/:id/feedback", function(req,res){
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
					res.redirect("/task/"+foundTask._id);
				}
			})
		}
	})
})


app.listen(3000, function(){
	console.log("Server running");
})