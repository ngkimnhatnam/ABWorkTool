var express 		= require("express"),
	bodyParser 		= require("body-parser"),
	mongoose		= require("mongoose"),
	passport		= require("passport"),
	localStrategy	= require("passport-local"),
	User			= require("./models/user"),
	Unit			= require("./models/unit"),
	Task			= require("./models/task"),
	methodOverride	= require("method-override"),
	app 			= express();

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

//Index route list all TASKS
app.get("/task", function(req,res){
	Task.find({}, function(err, allTasks){
		if(err){
			console.log(err);
		}else {
			res.render("tasks/index", {tasks: allTasks});
		}
	});
})

//Show new TASK form route 
app.get("/task/new", function(req,res){
	
	Unit.find({}, function(err, allUnits){
		if(err){
			console.log(err);
		}else {
			User.find({}, function(err, allUsers){
				if(err){
					console.log(err);
				}else {
					//console.log(allUsers);
					res.render("tasks/new", {units: allUnits, users: allUsers});
				}
			})
		}
	});
})

//Create new TASK route
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

//Show specific TASK
app.get("/task/:id", function(req,res){
	Task.findById(req.params.id, function(err, foundTask){
		if(err){
			console.log(err);
		}else {
			res.render("tasks/show", {task: foundTask});
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

//Show ALL UNIT route
app.get("/unit", function(req,res){
	Unit.find({}, function(err, allUnits){
		if(err){
			console.log(err);
		}else {
			res.render("units/", {units: allUnits});
		}
	});
})

//Show new UNIT form route
app.get("/unit/new", function(req,res){
	res.render("units/new");
})

//Create new UNIT, then redirects to show all units
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

//Show specific UNIT route
app.get("/unit/:id", function(req,res){
	Unit.findById(req.params.id, function(err, foundUnit){
		if(err){
			console.log(err);
		}else {
			res.render("units/show", {unit: foundUnit});
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
	if(req.body.manager==="on"){
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

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(3000, function(){
	console.log("Server running");
})