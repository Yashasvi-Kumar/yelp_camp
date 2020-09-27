require('dotenv').config();
var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var Comment=require("./models/comment");
var passport=require("passport");
var flash=require("connect-flash");
var LocalStrategy=require("passport-local");
var User=require("./models/user");
var methodOverride=require("method-override");
var async=require("async");

var Campground=require("./models/campground");
var seedDb=require("./seed");

var campgroundRoutes=require("./router/campgrounds");
var commentRoutes=require("./router/comments");
var indexRoutes=require("./router/index");
//seedDb();

mongoose.connect("mongodb://localhost/authentication_app");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
app.use(require("express-session")({
	secret:"rusty is the best dog",
	resave:false,
	saveUninitialized:false
}))


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
})

app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);

app.listen("3000",function(){
	console.log("server started");
})

