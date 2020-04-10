var mongoose = require("mongoose");

var taskSchema	=	mongoose.Schema({
	date: String,
	user: String,
	unit: String,
	// user: {
	// 	id: {
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: "User"
	// 	},
	// 	username: String
	// },
	// unit: {
	// 	id: {
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: "Unit"
	// 	},
	// 	name: String
	// },
	sidenote: String
});

module.exports = mongoose.model("Task", taskSchema);