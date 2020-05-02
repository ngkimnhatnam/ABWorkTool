var express 			= require("express"),
	router				= express.Router(),
	Unit				= require("../models/unit"),
	Task 				= require("../models/task"),
	User				= require("../models/user"),
	Feedback			= require("../models/feedback"),
	moment				= require("moment"),
	displayTime 		= moment().format("ddd DD MMM YYYY"),
	mongoClient 		= require('mongodb').MongoClient,
	// url 				= "mongodb://localhost",  
	// dbName 				= "airbnb",
	url					= "mongodb+srv://ngkimnhatnam:Nhatnam92@airbnbworktoolcluster-lkprs.mongodb.net",
	dbName				= "airbnbworktool",
	expressSanitizer 	= require("express-sanitizer"),
	thisMoment 			= new Date(),
	minDate 			= moment().format("YYYY-MM-DD"),
	middleware			= require("../middleware/index");
	thisMoment.setHours(0,0,0,0);

//INDEX TASK
router.get("/",middleware.isLoggedIn, function(req,res){
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
						res.render("tasks/index", {tasks: newArray, date: displayTime, user: req.user});
					}else {
						newArray.forEach(function(task){
							if(task.user.id === req.user._id.toString()){
								taskArray.push(task);
							}
						})
						res.render("tasks/index", {tasks: taskArray, date: displayTime,user: req.user});
					}
				} 	
				//console.log(result);
				client.close();
			});
	}); 
})

//NEW TASK
router.get("/new",middleware.isLoggedIn, function(req,res){
	Unit.find({}, function(err, allUnits){
		if(err){
			console.log(err);
		}else {
			User.find({}, function(err, allUsers){
				if(err){
					console.log(err);
				}else {
					//console.log(allUsers);
					res.render("tasks/new", {units: allUnits, users: allUsers, date: displayTime, thisMoment: minDate});
				}
			})
		}
	});
})

//CREATE TASK
router.post("/",middleware.isLoggedIn, function(req,res){
	
	User.findById(req.body.user, function(err, foundUser){
		if(err){
			console.log(err);
		}else {
			var assignedWorker = {
				id: foundUser._id,
				nickname: foundUser.nickname
			}
			//This prepares an array with units and status before creating a task
			var newUnit = [];
			if(err||!req.body.unit){
					req.flash("error", "Please select at least one unit");
					res.redirect("back");
				}else {
					if(typeof req.body.unit !== "string"){
						req.body.unit.forEach(function(unit){
								var assignedUnit = {
									name: unit,
									status: "Not started"
								}
							newUnit.push(assignedUnit);
						})
					}else {
						var assignedUnit = {
									name: req.body.unit,
									status: "Not started"
								}
						newUnit.push(assignedUnit);
					}
					
					req.body.sidenote	= req.sanitize(req.body.sidenote)
					var newTask = {date: req.body.date, user: assignedWorker, unit: newUnit, sidenote: req.body.sidenote};

					//Create new tasks and adds to DB
					Task.create(newTask,function(err, newlyCreatedTask){
						if(err){
							req.flash("error", "Unable to create task");
							console.log(err);
						}else {
							req.flash("success", "Task created");
							res.redirect("/task");
						}
					})
				}
			
			
		}
	})
})

//SHOW TASK
router.get("/:id",middleware.isLoggedIn, function(req,res){
	
	Task.findById(req.params.id).populate("feedback").exec(function(err, foundTask){
		if(err){
			req.flash("error", "Error finding task");
			res.redirect("back");
			console.log(err);
		}else {
			res.render("tasks/show", {task: foundTask, date: displayTime, dateNow: thisMoment});
		}
	})
})

//EDIT TASK
router.get("/:id/edit",middleware.isLoggedIn, function(req,res){
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
			req.flash("error", "Error finding task");
			res.redirect("back");
			console.log(err);
		}else {
			foundTask.date = moment(foundTask.date).format("YYYY-MM-DD");
			res.render("tasks/edit", {task: foundTask, units: unitList, users: userList, date: displayTime, thisMoment: minDate});
		}
	})
})

//UPDATE TASK
router.put("/:id",middleware.isLoggedIn, function(req,res){
	
	User.findById(req.body.user, function(err, foundUser){
		if(err){
			console.log(err);
		}else {
			var assignedWorker = {
				id: foundUser._id,
				nickname: foundUser.nickname
			}		
			//This prepares an array with units and status before creating a task
			var newUnit = [];
			if(err||!req.body.unit){
					req.flash("error", "Please select at least one unit");
					res.redirect("back");
				}else {
					if(typeof req.body.unit !== "string"){
						req.body.unit.forEach(function(unit){
								var assignedUnit = {
									name: unit,
									status: "Not started"
								}
							newUnit.push(assignedUnit);
						})
					}else {
						var assignedUnit = {
									name: req.body.unit,
									status: "Not started"
								}
						newUnit.push(assignedUnit);
					}
					
					req.body.sidenote	= req.sanitize(req.body.sidenote)
					var newTask = {date: req.body.date, user: assignedWorker, unit: newUnit, sidenote: req.body.sidenote};
					Task.findByIdAndUpdate(req.params.id, newTask,function(err, updatedTask){
						if(err){
							req.flash("error", "Error updating task");
							res.redirect("back");
						}else {
							req.flash("success", "Task updated");
							res.redirect("/task/"+req.params.id);
						}
					})
					
				}
			
			
		}
	})
})

//UPDATE TASK STATUS
router.put("/:id/status",middleware.isLoggedIn, function(req,res){
	
	Task.findById(req.params.id, function(err, foundTask){
		if(err){
			req.flash("error", "Error finding task");
			res.redirect("back");
			console.log(err);
		}else {
			var newTask;
			var newUnitArray = [];
			foundTask.unit.forEach(function(unit){
				if(unit._id.toString() === req.body.nextTaskStatus.toString()){
					if(unit.status ==="Not started"){
						var newUnitStatus = "In progress";
					}
					if(unit.status ==="In progress"){
						var newUnitStatus = "Cleaning done";
					}
					if(unit.status ==="Cleaning done"){
						var newUnitStatus = "All done";
					}
					var newUnit = {
						_id: unit._id,
						name: unit.name,
						status: newUnitStatus
					}
					newUnitArray.push(newUnit);
					
				}else {
					newUnitArray.push(unit);
				}
				var newUser = {
						id: foundTask.user.id,
						nickname: foundTask.user.nickname
					}
				console.log("newUnitArray here.. "+newUnitArray);
				newTask = {date: req.body.date, user: newUser, unit: newUnitArray, sidenote: req.body.sidenote};
			})
			Task.findByIdAndUpdate(req.params.id, newTask,function(err, updatedTask){
				if(err){
					req.flash("error", "Error updating status");
					res.redirect("back");
					console.log(err);
				}else {
					res.redirect("/task/"+req.params.id);
				}
			})
		}
	})
})

//DELETE TASK
router.delete("/:id", function(req,res){
		
		Task.findByIdAndRemove(req.params.id,function(err){
		if(err){
			req.flash("error", "Error deleting task");
			res.redirect("back");
			console.log(err);
		}else {
			req.flash("success", "Task deleted");
			res.redirect("/task");
		}
		})
	
	
})

module.exports 	= router;








