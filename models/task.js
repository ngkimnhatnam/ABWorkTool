var mongoose = require("mongoose");

var taskSchema	=	mongoose.Schema({
	date: Date,
	user: {
		id: String,
		nickname: String
	},
	//user: String,
	unit: [
		
	],
	feedback: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Feedback"
		}
	],
	sidenote: String
});

module.exports = mongoose.model("Task", taskSchema);