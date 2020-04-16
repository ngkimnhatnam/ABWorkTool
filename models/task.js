var mongoose = require("mongoose");

var taskSchema	=	mongoose.Schema({
	date: Date,
	// user: {
	// 	id: {
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: "User"
	// 	},
	// 	username: String
	// },
	user: String,
	unit: [
		
	],
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