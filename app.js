var express = require("express"),
	bodyParser = require("body-parser"),
	mongoose	= require("mongoose"),
	//passport	= require("passport"),
	//localStrategy	= require("passport-local"),
	//User			= require("./models/user"),
	app 	= express();

mongoose.connect("mongodb://localhost/airbnb",{ useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");

//PASSPORT CONFIGURATION
// app.use(require("express-session")({
// 	secret:"Piu is super kute",
// 	resave: false,
// 	saveUninitialized: false
// }));

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

//This function calls on every route, passing req.user as parameter to check
//if user is empty or logged in, then next() proceeds to following route call
// app.use(function(req,res,next){
// 	res.locals.currentUser = req.user;
// 	next();
// });

//Schema setup
var unitSchema 	= 	mongoose.Schema({
	name: String,
	image: String,
	checkinout: String
});
var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	isManager: Boolean
});

var taskSchema	=	mongoose.Schema({
	date: String,
	user: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	unit: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Unit"
		},
		name: String
	},
	sidenote: String
});

var Unit 	= mongoose.model("Unit", unitSchema);
var User 	= mongoose.model("User", userSchema);
var Task	= mongoose.model("Task", taskSchema);

var tasks = [
	{
		date: "Mar 31",
		unit: "Puna 5",
		user: "Piu",
		sidenote: "Buy buy buy"
	},
	{
		date: "Apr 11",
		unit: "Penger",
		user: "Meo",
		sidenote: "Buy buy buy"
	},
	{
		date: "Apr 21",
		unit: "Helsin",
		user: "Piu",
		sidenote: "Buy buy buy"
	},
	{
		date: "Apr 31",
		unit: "Puna 5",
		user: "Piu",
		sidenote: "Buy buy buy"
	}
]

//Landing page
app.get("/", function(req,res){
	res.render("landing");
})

//Index route list all TASKS
app.get("/task", function(req,res){
	console.log(tasks);
	res.render("tasks/index", {tasks: tasks});
})

//Show new TASK form route 
app.get("/task/new", function(req,res){
	res.render("tasks/new");
})

//Create new TASK route
// app.post("/task", function(req,res){
// 	var date = req.body.date;
// 	var unit = req.body.unit;
// 	var worker = req.body.worker;
// 	var sidenote = req.body.sidenote;
// 	var newTask = {date: date,}
// })

//Show info about specific UNIT route
app.get("/unit", function(req,res){
	Unit.find({}, function(err, allUnits){
		if(err){
			console.log(err);
		}else {
			res.render("units/show", {units: allUnits});
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

//To REGISTER route
app.get("/register", function(req,res){
	res.render("register");
})

//Create new USER then redirects
app.post("/register", function(req,res){
	if(req.body.manager==="on"){
		var newUser = new User({username: req.body.username, password: req.body.password, isManager: true});
	}else {
		var newUser = new User({username: req.body.username, password: req.body.password, isManager: false});
	}
	
	
	//Create new user and adds to DB
	// User.register(newUser, req.body.password,function(err,newlyCreatedUser){
	// 	if(err){
	// 		console.log(err);
	// 		return res.render("/register");
	// 	}
	// 	passport.authenticate("local")(req,res,function(){
	// 		res.redirect("/task");
	// 	})
	// });
	
	User.create(newUser, function(err, newlyCreatedUser){
		if(err){
			console.log(err);
			console.log(newlyCreatedUser);
		}else {
			
			res.redirect("/");
		}
	})
	
})

// function isLoggedIn(req, res, next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/login");
// }

app.listen(3000, function(){
	console.log("Server running");
})