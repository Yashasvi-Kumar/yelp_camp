var mongoose=require("mongoose");
var userSchema=new mongoose.Schema({
	username:{type:String, unique:true,required:true},
	password:String,
	avatar:String,
	firstName:String,
	lastName:String,
	email:{type:String,unique:true,required:true},
	resetPasswordToken:String,
	resetPasswordExpires:Date,
	isAdmin:{type:Boolean,default:false}
})
var passportLocalMongoose=require("passport-local-mongoose");
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);