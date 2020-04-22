var mongoose = require("mongoose");

var feedbackSchema	=	mongoose.Schema({
	content: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		nickname: String
	}
});

module.exports = mongoose.model("Feedback", feedbackSchema);