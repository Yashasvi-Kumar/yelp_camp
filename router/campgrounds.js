var express=require("express");
var router=express.Router();
var Campground=require("../models/campground");
var middleware=require("../middleware");
var async=require("async");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'coordinate', 
  api_key: 346433247551141, 
  api_secret: 'ra0k-oYZ4uaMKy_DscDeCvZo5og'
});

router.get("/campgrounds",function(req,res){
	var noMatch="";
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex},function(err,campgrounds){
		if(err){
			console.log("something went wrong");
		}
		else{
			
			if(campgrounds.length<1){
				noMatch="No query Matched Please try again"
			}
			console.log("you got it");
			res.render("campgrounds/campgrounds",{campgrounds:campgrounds,currentUser:req.user,noMatch:noMatch});
		}
	})
	}
	else{
	Campground.find({},function(err,campgrounds){
		if(err){
			console.log("something went wrong");
		}
		else{
			console.log("you got it");
			res.render("campgrounds/campgrounds",{campgrounds:campgrounds,currentUser:req.user,noMatch:noMatch});
		}
	})
	}
	
})
//CREATE - add new campground to DB
router.post("/campgrounds", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
});
router.get("/campgrounds/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/obj");
})
router.get("/campgrounds/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundId){
		if(err){
			console.log(err);
		}
		else{
			console.log(foundId);
			res.render("campgrounds/show",{campground:foundId});
		}
	})
	
})
	
//Campground updation

router.get("/campgrounds/:id/edit",middleware.isCampgroundOwner,function(req,res){
		Campground.findById(req.params.id,function(err,campgrounds){
			
				res.render("campgrounds/edit",{campgrounds:campgrounds});
	
})
})
// UPDATE CAMPGROUND ROUTE
router.put("/campgrounds/:id", upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});

router.delete('/campgrounds/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports=router;