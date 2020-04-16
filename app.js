var express 		= require("express"),
	bodyParser 		= require("body-parser"),
	mongoose		= require("mongoose"),
	passport		= require("passport"),
	localStrategy	= require("passport-local"),
	User			= require("./models/user"),
	Unit			= require("./models/unit"),
	Task			= require("./models/task"),
	methodOverride	= require("method-override"),
	moment			= require("moment");
	app 			= express();

var thisMoment = new Date();
thisMoment.setHours(0,0,0,0);
var minDate = moment().format("YYYY-MM-DD");
var now = moment().format("ddd DD MMM YYYY");
 
var mongoClient = require('mongodb').MongoClient;  
var url = "mongodb://localhost";  
var dbName 	= "airbnb";
 
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
					if(task.date.getTime()>= thisMoment.getTime()){
						task.date = moment(task.date).format("ddd DD MMM YYYY");
						newArray.push(task);
					}		
				})
				if(req.user.isManager){
					res.render("tasks/index", {tasks: newArray, date: now});
				}else {
					newArray.forEach(function(task){
						if(task.user === req.user.username){
							taskArray.push(task);
						}
					})
					res.render("tasks/index", {tasks: taskArray, date: now});
				}
			} 	
			//console.log(result);
    		client.close();
  		});
	}); 
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
	
	var date = req.body.date;
	var worker = req.body.worker;
	var unit = req.body.unit;
	var sidenote = req.body.sidenote;
	
	var newTask = {date: date, user: worker, unit: unit, sidenote: sidenote};
	console.log(req.body);
	//Create new tasks and adds to DB
	Task.create(newTask,function(err, newlyCreatedTask){
		if(err){
			console.log(err);
			
		}else {
			console.log(req.body);
			res.redirect("/task");
		}
	})
})

//SHOW TASK
app.get("/task/:id", function(req,res){
	var toBeShownTask;
	Task.findById(req.params.id, function(err, foundTask){
		if(err){
			console.log(err);
		}else {
			// toBeShownTask = foundTask;
			// toBeShownTask.date.setHours(0,0,0,0);
			// console.log("Be4 format toBESHOWNDate "+toBeShownTask.date);
			// toBeShownTask.date = moment(toBeShownTask.date).format("LLL");
			// console.log("After format toBESHOWNDate "+toBeShownTask.date);
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
	Task.findByIdAndUpdate(req.params.id, req.body,function(err, updatedTask){
		if(err){
			res.redirect("/task");
		}else {
			res.redirect("/task/"+req.params.id);
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
	var unitName = req.body.name;
	var unitImage = req.body.image;
	var unitTime = req.body.checkinout;
	var newUnit = {name: unitName,image: unitImage, checkinout: unitTime};
	
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
		var newUser = new User({username: req.body.username, isManager: true});
	}else {
		var newUser = new User({username: req.body.username, isManager: false});
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
					res.render("tasks/history", {tasks: newArray, date: now, route: toCurrent});
				}else {
					newArray.forEach(function(task){
						if(task.user === req.user.username){
							taskArray.push(task);
						}
					})
					res.render("tasks/history", {tasks: taskArray, date: now, route: toCurrent});
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
		console.log(req.user);
		return next();
	}
	res.redirect("/");
}



app.listen(3000, function(){
	console.log("Server running");
})