var express 			= require("express"),
	bodyParser 			= require("body-parser"),
	mongoose			= require("mongoose"),
	passport			= require("passport"),
	localStrategy		= require("passport-local"),
	User				= require("./models/user"),
	Unit				= require("./models/unit"),
	Task				= require("./models/task"),
	Feedback			= require("./models/feedback"),
	methodOverride		= require("method-override"),
	moment				= require("moment"),
	nodemailer			= require("nodemailer"),
	flash				= require("connect-flash"),
	expressSanitizer 	= require("express-sanitizer"),
	mongoClient 		= require('mongodb').MongoClient,  
	// url 				= "mongodb://localhost",  
	// dbName 				= "airbnb",
	url					= "mongodb+srv://ngkimnhatnam:Nhatnam92@airbnbworktoolcluster-lkprs.mongodb.net",
	dbName				= "airbnbworktool",
	sortMethod 			= "date",
	app 				= express();
	
//requiring routes
var unitRoutes			= require("./routes/units"),
	feedbackRoutes		= require("./routes/feedbacks"),
	indexRoutes			= require("./routes/index"),
	taskRoutes			= require("./routes/tasks");

var thisMoment = new Date();
thisMoment.setHours(0,0,0,0);
var minDate = moment().format("YYYY-MM-DD");
var displayTime = moment().format("ddd DD MMM YYYY");

var dbUrl = process.env.DATABASEURL || "mongodb://localhost/airbnb"
mongoose.connect(dbUrl,{ useNewUrlParser: true, useUnifiedTopology: true });
 // mongoose.connect("mongodb+srv://ngkimnhatnam:Nhatnam92@airbnbworktoolcluster-lkprs.mongodb.net/airbnbworktool?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true });


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.use(flash());

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
	res.locals.error		= req.flash("error");
	res.locals.success		= req.flash("success");
	next();
});

//These use required routes for other routes/files to work, also passing
//in route directories as preffixes in get/post requests
app.use("/unit", unitRoutes);
app.use("/task", taskRoutes);
app.use("/task/:id/feedback", feedbackRoutes);
app.use(indexRoutes);


var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});