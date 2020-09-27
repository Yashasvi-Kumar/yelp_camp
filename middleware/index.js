var Campground=require("../models/campground");
var Comment=require("../models/comment");
var middlewareObj={};
middlewareObj.isCampgroundOwner=function(req,res,next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id,function(err,campgrounds){
		if(err){
			console.log(err);
		}
		else{
			if(campgrounds.author.id.equals(req.user._id) || req.user.isAdmin){
				next();
			}
			else{
				req.flash("error","You don't have permission to do that");
				res.redirect("back");
			}
			
		}
	})
	}
	else{
		req.flash("error","You need to login first");
		res.redirect("back");
	}
	
}


middlewareObj.isCommentOwner=function(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,comments){
		if(err){
			console.log(err);
		}
		else{
			if(comments.author.id.equals(req.user._id)){
				next();
			}
			else{
				req.flash("error","You don't have permission to do that");
				res.redirect("back");
			}
			
		}
	})
	}
	else{
		req.flash("error","You need to login first");
		res.redirect("back");
	}
}
middlewareObj.isLoggedIn=function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","you need to login first");
	res.redirect("/login");
}
module.exports=middlewareObj;