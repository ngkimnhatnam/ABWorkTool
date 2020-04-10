var mongoose	= require("mongoose");

var unitSchema 	= 	mongoose.Schema({
	name: String,
	image: String,
	checkinout: String
});

module.exports 	= mongoose.model("Unit", unitSchema);