var express 			= require("express"),
	router				= express.Router(),
	Unit				= require("../models/unit"),
	moment				= require("moment"),
	displayTime 		= moment().format("ddd DD MMM YYYY"),
	expressSanitizer 	= require("express-sanitizer"),
	middleware			= require("../middleware/index");

//INDEX UNIT
router.get("/",middleware.isLoggedIn, function(req,res){
	var toUnit = {
		route: "/unit/new",
		name: "new unit"
	};
	Unit.find({}, function(err, allUnits){
		if(err){
			req.flash("error", "Error loading units");
			res.redirect("back");
			console.log(err);
		}else {
			res.render("units/", {units: allUnits, date: displayTime, route: toUnit,user: req.user});
		}
	});
})

//NEW UNIT
router.get("/new",middleware.isLoggedIn, function(req,res){
	res.render("units/new", {date: displayTime});
})

//CREATE UNIT
router.post("/",middleware.isLoggedIn, function(req,res){
	req.body.name			= req.sanitize(req.body.name)
	req.body.name.toString()
	req.body.image			= req.sanitize(req.body.image)
	req.body.checkinout		= req.sanitize(req.body.checkinout)
	req.body.description	= req.sanitize(req.body.description)
	var newUnit = {name: req.body.name,image: req.body.image, checkinout: req.body.checkinout, description: req.body.description};
	
	//Create new units and adds to DB
	Unit.create(newUnit,function(err, newlyCreatedUnit){
		if(err){
			req.flash("error", "Error creating unit");
			res.redirect("back");
			console.log(err);
			
		}else {
			req.flash("success", "Unit created");
			res.redirect("/unit");
		}
	})
})

//SHOW UNIT
router.get("/:id",middleware.isLoggedIn, function(req,res){
	Unit.findById(req.params.id, function(err, foundUnit){
		if(err){
			req.flash("error", "Error finding unit");
			res.redirect("back");
			console.log(err);
		}else {
			res.render("units/show", {unit: foundUnit, date: displayTime});
		}
	})
})

//EDIT UNIT 
router.get("/:id/edit",middleware.isLoggedIn, function(req,res){
	Unit.findById(req.params.id, function(err, foundUnit){
		if(err){
			req.flash("error", "Error finding unit");
			res.redirect("back");
			console.log(err);
		}else {
			res.render("units/edit", {unit: foundUnit, date: displayTime});
		}
	})
})

//UPDATE UNIT
router.put("/:id",middleware.isLoggedIn,function(req,res){
	req.body.unit.name			= req.sanitize(req.body.unit.name)
	req.body.unit.image			= req.sanitize(req.body.unit.image)
	req.body.unit.checkinout	= req.sanitize(req.body.unit.checkinout)
	req.body.unit.description	= req.sanitize(req.body.unit.description)
	Unit.findByIdAndUpdate(req.params.id,req.body.unit, function(err,updatedUnit){
		if(err){
			req.flash("error", "Error updating unit");
			res.redirect("back");
			console.log(err);
		}else {
			req.flash("success", "Unit updated");
			res.redirect("/unit/"+req.params.id);
		}
	})
})

//DELETE UNIT
router.delete("/:id",middleware.isLoggedIn, function(req,res){
	Unit.findByIdAndRemove(req.params.id, function(err){
		if(err){
			req.flash("error", "Error deleting unit");
			res.redirect("back");
			console.log(err);
		}else {
			req.flash("success", "Unit deleted");
			res.redirect("/unit");
		}
	})
})

module.exports = router;
