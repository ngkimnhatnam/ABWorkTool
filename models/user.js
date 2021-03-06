var mongoose = require("mongoose");
var passportLocalMongoose	= require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
	username: String,
	nickname: String,
	password: String,
	isManager: Boolean
});

UserSchema.plugin(passportLocalMongoose);

module.exports	= mongoose.model("User", UserSchema);