var express = require('express');
const Comment = require("./comment.js")
var router = express.Router();
const localStrategy = require("passport-local");
var passport = require('passport')   
var userModel = require('./users.js')
const crypto = require('crypto');
const path = require(`path`);
const { extname } = require('path');
const cloudinary = require('cloudinary').v2;
	const multer = require('multer');
var postModel = require("./post.js")
var os = require("os")
var chatModel = require("./chat.js")
var fs = require("fs");
var socket = require("../socketapi.js")
const cron = require('node-cron');
const { log } = require('console');
var GoogleStrategy = require('passport-google-oidc');
var dotenv = require('dotenv')

var storyModel = require("./story.js");
const comment = require('./comment.js');
var socket = require("../socketapi.js");

// Configuration 
dotenv.config()
var def = {
  url : "https://res.cloudinary.com/djbp0vlym/image/upload/v1682241238/ilwjkj9gf085jwxfyalj.jpg",
  // publicid : "ilwjkj9gf085jwxfyalj"
}
cloudinary.config({
	cloud_name: "djbp0vlym",
	api_key: "789757367672325",
	api_secret: "90mPmiNZFWYJh9lKBN8oG_ATx74"
  });


// const { render } = require('../app');
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */ 
router.get('/', function(req, res, next) {
  res.render('index');
});    
router.get(`/login`,function(req,res){
  res.render("login")
})

router.post('/register',function(req,res,next){
  var data = new userModel({
    name:req.body.name,
username:req.body.username,
email:req.body.email,
image:req.body.image,
profileimg:def
  });
 
  userModel.register(data,req.body.password)
  .then(function(createdUser){
    passport.authenticate("local")(req,res,function(){
      // console.log(createdUser)
      res.redirect("/home")
    })
  })
})

router.post("/login",passport.authenticate("local",{
  successRedirect:"/home",
  failureRedirect:"/login"
}),function(req,res){

})

let postid = "" ;
const storage = multer.memoryStorage();


const upload = multer({ storage: storage });


router.post('/posts', upload.array('files', 10), function(req, res) {
  const files = req.files; // Get the uploaded files
  const imgs = [];
  
  // Loop over the uploaded files and upload them to Cloudinary
  files.forEach(function(file) {
    const buffer = file.buffer; // Get the buffer of the uploaded file
    const options = { resource_type: 'auto' };
    
    // Create a temporary file with the buffer contents
    const tmpPath = path.join(os.tmpdir(), file.originalname);
    fs.writeFile(tmpPath, buffer, function(err) {
      if (err) {
        console.log('Error creating temporary file:', err);
      } else {
        // Pass the temporary file path to the upload method
        cloudinary.uploader.upload(tmpPath, options, function(error, result) {
          if (error) {
            console.log('Error uploading file:', error);
          } else {
            console.log('File uploaded:', result);
            const imgData = {
              url: result.secure_url,
              type: result.resource_type,
              publicid: result.public_id
            };
            console.log(imgData)
            imgs.push(imgData);
            if (imgs.length === files.length) {
              // All files have been uploaded
              userModel.findOne({username:req.session.passport.user})
                .then(function(user){
                  postModel.create({

                    userid: user._id,
                    imgs: imgs,
                  }).then(function(post){
                    user.post.push(post._id);
                    postid = post._id
                    user.save().then(function(elem){
                      postModel.findOne({username:req.session.passport.user}).then(function(user){
                        res.redirect("/post")
                      })
                    })
                  })
                })
            }
          }
        });
      }
    });
  });
});

router.post("/savechat", async function (req, res, next) {
  try {
    // Create a new chat document with the data from the request body
    var Chat = new chatModel({
      sender_id: req.body.sender_id,
      reciever_id: req.body.reciever_id,
      message: req.body.message,
 
    });

    // Save the chat document to the database
    var newChat = await Chat.save();

    // Return the response with the newChat data (including the createdAt timestamp)
    res.status(200).json({ success: true, msg: "Chat Inserted!", data: newChat });
  } catch (error) {
    // If an error occurs during the save operation, send an error response
    res.status(500).json({ success: false, msg: "Error saving chat message.", error: error.message });
  }
});

router.get("/post", function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinUser){
    postModel.findOne(postid).populate("userid")
    .then(function(user){
    res.render("post",{user:user,loggedinUser})
    })
  })
})

router.get("/profile/:id",isLoggedIn, function(req,res){
  userModel.findOne({_id:req.params.id}).populate("post")
  .then(function(loggedInuser){
    userModel.findOne({username:req.session.passport.user})
    .then(function(user){

      res.render("profile",{user:loggedInuser,main:user})
    })
    
  })
 })

 router.get("/uservideo/:id",isLoggedIn, function(req,res){
  userModel.findOne({_id:req.params.id}).populate("post")
  .then(function(loggedInuser){
    userModel.findOne({username:req.session.passport.user})
    .then(function(user){

      res.render("uservid",{user:loggedInuser,main:user})
    })
    
    
  })
 })
 router.get("/userpost/:id",isLoggedIn, function(req,res){
  userModel.findOne({_id:req.params.id}).populate("post")
  .then(function(loggedInuser){
    userModel.findOne({username:req.session.passport.user})
    .then(function(user){

      res.render("userpost",{user:loggedInuser,main:user})
    })
    
  })
 })
router.get("/logout",function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  })});


  router.get("/home", isLoggedIn, async function(req, res) {
    userModel.findOne({username: req.session.passport.user})
    .then(function(loggedInuser) {
      postModel.find()
      .populate("userid", "-password -email -createdAt -updatedAt")
      .populate({
        path: "comment",
        populate: {
          path: "author",
          model: "user"
        
        }
      })
      .then(function(posts) {
        posts.forEach(function(p){
          console.log(p.comment)
        })
        storyModel.find().then(function(stories) {
          res.render("home", {loggedInuser: loggedInuser, user: posts, stories: stories});
        })
      })
    })
    // const user = await userModel.findOne({username: req.session.passport.user})
    // const post = await postModel.find()
    //                 .populate({
    //                   path: 'comment',
    //                   populate: { path: 'author', model: 'user' }
    //                 })
    // // const comment = await post.populate("comment")
    // const story  = await user.populate("story")
    // console.log("userdata" , user )
    // console.log("post data : " , post)
    // // console.log("comment : " , comment)
    // res.render("home", {loggedInuser: user, user: post, stories: story});
  })
  
router.post("/home",isLoggedIn,upload.single("image"),function(req,res){
	userModel.findOne({username:req.session.passport.user})
	.then(function(loggedInuser){
		loggedInuser.profileimg = req.file.filename;
		loggedInuser.save().then(function(){
			
			res.redirect("/home")
		})
	})
})



router.get("/delete/:id" , isLoggedIn ,async function(req , res){
  const user =  await userModel.findOne({_id : req.params.id})
  console.log(user)
  const alluser = await userModel.find()
  alluser.forEach(function(elem){
    if(elem.follower.indexOf(user._id))
    {
      elem.follower.splice(user._id , 1)
    }
    if(elem.following.indexOf(user._id))
    {
      elem.following.splice(user._id , 1)
    }
  })
    comment.deleteMany({author :  req.params.id})
    const allposts = await postModel.find()
    allposts.forEach(function(elem){
          if(elem.like.indexOf(user._id))
        {
          elem.like.splice(user._id , 1)
        }
    })
    // const posts = await postModel.find({_id : user.post})
    const {post} = await user.populate("post")
    post.forEach(async function(id){
      cloudinary.uploader.destroy(id.publicid, { resource_type: id.type } , function(error, result) {
        if (error) {
          console.log('Error deleting video:', error);
        } else {
          console.log('Video deleted:', result);
        }
      }); 
      await postModel.findByIdAndDelete(id)
    })
    await userModel.findOneAndDelete({_id : user._id})
    res.redirect("/login");
    // cloudinary.uploader.destroy(id.publicid, { resource_type: id.type } )

})

// router.get("/delete/user", isLoggedIn, async function(req, res) {
//   const user = await userModel.findOne({ username: req.session.passport.user });
//   const allusers = await userModel.find();

//   for (const elem of allusers) {
//     if (elem.follower.indexOf(user._id) >= 0) {
//       elem.follower.splice(elem.follower.indexOf(user._id), 1);
//       await elem.save();
//     }
//     if (elem.following.indexOf(user._id) >= 0) {
//       elem.following.splice(elem.following.indexOf(user._id), 1);
//       await elem.save();
//     }
//   }

//   await comment.deleteMany({ author: req.session.passport.user });

//   const allposts = await postModel.find();
//   for (const elem of allposts) {
//     if (elem.like.indexOf(user._id) >= 0) {
//       elem.like.splice(elem.like.indexOf(user._id), 1);
//       await elem.save();
//     }
//     if (elem.userid.equals(user._id)) {
//       cloudinary.uploader.destroy(elem.publicid, { resource_type: elem.type }, function(
//         error,
//         result
//       ) {
//         if (error) {
//           console.log("Error deleting video:", error);
//         } else {
//           console.log("Video deleted:", result);
//         }
//       });
//       await postModel.findByIdAndDelete(elem._id);
//     }
//   }

//   await userModel.findOneAndDelete({ _id: user._id });

//   // clear the session and redirect to the login page
//   req.session.destroy(function(err) {
//     res.redirect("/login");
//   });
// });


router.post("/finalpost/:id/:i",async function(req,res){
  var post = await postModel.findOne({_id:req.params.id})
  var {cmnt} = req.body;
  post.caption = cmnt ;
  await post.save()
  res.redirect(`/profile/${req.params.i}`)
})
router.get("/clouddel/:id/:i",async function(req,res){
var post =  await postModel.findOne({_id:req.params.id})
post.imgs.forEach(function(id){
cloudinary.uploader.destroy(id.publicid, { resource_type: id.type } , function(error, result) {
  if (error) {
    console.log('Error deleting video:', error);
  } else {
    console.log('Video deleted:', result);
  }
});

})
 var user = await userModel.findOne({username:req.session.passport.user})
    var pr =   user.post.indexOf(req.params.id)
            user.post.splice(pr,1)
user.save().then(function(){})
await postModel.findOneAndDelete({_id:req.params.id})
res.redirect(`/profile/${req.params.i}`)
    // res.redirect("/profile")
})


router.get("/delpost/:id/:i",async function(req,res){
  var post =  await postModel.findOne({_id:req.params.id})
  post.imgs.forEach(function(id){
  cloudinary.uploader.destroy(id.publicid, { resource_type: id.type } , function(error, result) {
    if (error) {
      console.log('Error deleting video:', error);
    } else {
      console.log('Video deleted:', result);
    }
  });
  
  })
   var user = await userModel.findOne({username:req.session.passport.user})
      var pr =   user.post.indexOf(req.params.id)
              user.post.splice(pr,1)
  user.save().then(function(){})
  await postModel.findOneAndDelete({_id:req.params.id})
  res.redirect(`/userpost/${req.params.i}`)
      // res.redirect("/profile")
  })

router.get("/edit", isLoggedIn ,async function(req,res){
  var user  = await userModel.findOne({username : req.session.passport.user});
  res.render("edit" , {user})
})
router.get("/remove/:id",  function(req, res) {
  userModel.findOne({_id:req.params.id})
  .then(function(profile){
    cloudinary.uploader.destroy(profile.profileimg.publicid, function(error, result) {
      console.log(result, error);
    });
  })
  userModel.findOne({username:req.session.passport.user})
  .then(function(user){
    user.profileimg = def;
    user.save().then(function(){
      res.redirect("/edit")
    })
  })
});

router.post("/edit/:id", isLoggedIn ,  function(req,res){
  userModel.findOneAndUpdate({username:req.session.passport.user},{username:req.body.username,name:req.body.name,email:req.body.email , bio : req.body.bio})
  .then(function(data){
    res.redirect(`/profile/${req.params.id}`)
  })
})
router.post('/editimg', upload.array('files', 1), function(req, res) {
  const files = req.files; // Get the uploaded files
  // let imgs = "";
  let imgs = "";
  
  // Loop over the uploaded files and upload them to Cloudinary
  files.forEach(function(file) {
    const buffer = file.buffer; // Get the buffer of the uploaded file
    const options = { resource_type:'image' };
    
    // Create a temporary file with the buffer contents
    const tmpPath = path.join(os.tmpdir(), file.originalname);
    fs.writeFile(tmpPath, buffer, function(err) {
      if (err) {
        console.log('Error creating temporary file:', err);
      } else {
        // Pass the temporary file path to the upload method
        cloudinary.uploader.upload(tmpPath, options, function(error, result) {
          if (error) {
            console.log('Error uploading file:', error);
          } else {
            console.log('File uploaded:', result);
            const imgData = {
              url: result.secure_url,
              publicid: result.public_id
            };
            imgs = imgData
            userModel.findOne({username:req.session.passport.user})
            .then(function(profile){
              cloudinary.uploader.destroy(profile.profileimg.publicid, function(error, result) {
                console.log(result, error);
              });
            })
         
            
              userModel.findOne({username:req.session.passport.user})
              .then(function(user){
                user.profileimg = imgs
                user.save().then(function(){
                  res.redirect("/edit")
                })
              })
          
            
          }
        });
      }
    });
  });
});
router.get("/like/:id/:i",function(req,res){
    postModel.findOne({_id:req.params.i})
    .then(function(user){
      // console.log(user)
      // res.redirect("back")
      user.like.push(req.params.id)
      user.save().then(function(){

        res.redirect("back")
      })
    })
})
router.get("/unlike/:id/:i",function(req,res){
  postModel.findOne({_id:req.params.i})
  .then(function(user){
    var l = user.like.indexOf(req.params.i);
    user.like.splice(l,1)
    user.save().then(function(){
      res.redirect("back")
    })
  })
})
// router.get("/chat",function(req,res){
//   userModel.findOne({username:req.session.passport.user})
//   .then(function(user){
//     res.render("chat",{loggedInuser:user})
//   })
// })
// router.get("/chat/msg", isLoggedIn,function(req,res){

// })
router.get("/chat", isLoggedIn, async function (req, res) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(user){
    userModel.find({ _id: { $nin: [user._id] } }).then(function(all){

      res.render("msg",{loggedInuser:user,all:all})
      
    })
  })
}); 
// router.get("/following/:id", function(req,res){
//   userModel.findOne({_id:req.params.id}).then(function(userf){
// // console.log(user)
//     userf.following.push(req.params.id)
//    userf.save().then(function(){
//     userModel.findOne({username:req.session.passport.user}).then(function(loggedin){
//       console.log(loggedin)
//       loggedin.follower.push(req.params.id);
//   loggedin.save().then(function(){

//     res.redirect("back")
//   })
//     })

//    })
//   })


// })

// router.get("/following/:id" , isLoggedIn ,  async (req, res, next) => {
//   try {
//     const user = await userModel.findOne({username:req.session.passport.user})
//       const id = req.params.id;
//       const data = await userModel.findById(id).exec();
//       if (!user.following.includes(id)) {
//           user.following.push(id);
//           await user.save();
          
//           data.follower.push(user._id)
//           await data.save();
          
//           res.redirect("back")
//           console.log("now you are following " + data.name)
//       }
//       else {
//           console.log("already  followed")
//           res.redirect("back")

//       }

//   } catch (error) {
//       res.status(500).json(error)
//   }
// }
// )

// router.get("/unfollow/:id",isLoggedIn,async function(req,res){
//   const user = await userModel.findOne({username:req.session.passport.user})
  
//     try {
//         const id = req.params.id;
        
//         const data = await userModel.findById(id).exec();
//         if (user.following.includes(id)) {
//             user.following.splice(user.following.indexOf(id), 1);
//             await user.save();
            
//             data.follower.splice(data.follower.indexOf(user._id), 1);
//             await data.save();
            
//             console.log("you unfollwed " + data.name)
//             res.redirect("back")

//         }
//         else {
//             console.log("first  follow for unfollow")
//           res.redirect("back")

//         }

//     } catch (error) {
//         console.log(error)
//         res.redirect("back")

//     }

// })
router.get("/following/:id" , isLoggedIn ,  async (req, res, next) => {
  try {
    const user = await userModel.findOne({username:req.session.passport.user})
    const id = req.params.id;
    const data = await userModel.findById(id).exec();
    if (!user.following.includes(id)) {
      user.following.push(id);
      await user.save();

      data.follower.push(user._id)
      await data.save();

      // check for follow-back condition
      if (data.following.includes(user._id)) {
        console.log("Follow back condition fulfilled");
        user.following.push(data._id);
        await user.save();
      }

      console.log("now you are following " + data.name)
      res.send("Followed successfully");
    }
    else {
      console.log("already followed")
      res.send("Already followed");
    }

  } catch (error) {
    res.status(500).json(error)
  }
});

router.get("/unfollow/:id",isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user})
  
  try {
    const id = req.params.id;
    
    const data = await userModel.findById(id).exec();
    if (user.following.includes(id)) {
      user.following.splice(user.following.indexOf(id), 1);
      await user.save();
      
      data.follower.splice(data.follower.indexOf(user._id), 1);
      await data.save();

      // check for unfollow-back condition
      if (data.following.includes(user._id)) {
        console.log("Unfollow back condition fulfilled");
        data.following.splice(data.following.indexOf(user._id), 1);
        await data.save();
      }

      console.log("you unfollowed " + data.name)
      res.send("Unfollowed successfully");
    }
    else {
      console.log("first follow for unfollow")
      res.send("First follow the user to unfollow");
    }

  } catch (error) {
    res.status(500).json(error)
  }
});


  
router.post('/story', upload.array('files', 10), function(req, res) {
  const files = req.files; // Get the uploaded files
  const imgs = [];
  
  // Loop over the uploaded files and upload them to Cloudinary
  files.forEach(function(file) {
    const buffer = file.buffer; // Get the buffer of the uploaded file
    const options = { resource_type: 'auto' };
    
    // Create a temporary file with the buffer contents
    const tmpPath = path.join(os.tmpdir(), file.originalname);
    fs.writeFile(tmpPath, buffer, function(err) {
      if (err) {
        console.log('Error creating temporary file:', err);
      } else {
        // Pass the temporary file path to the upload method
        cloudinary.uploader.upload(tmpPath, options, function(error, result) {
          if (error) {
            console.log('Error uploading file:', error);
          } else {
            console.log('File uploaded:', result);
            const imgData = {
              url: result.secure_url,
              type: result.resource_type,
              publicid: result.public_id
            };
            console.log(imgData)
            imgs.push(imgData);
            if (imgs.length === files.length) {
              // All files have been uploaded
              userModel.findOne({username:req.session.passport.user})
                .then(function(user){
                  storyModel.create({

                    userid: user._id,
                    imgs: imgs,
                  }).then(function(story){
                    user.story.push(story._id);
                    postid = story._id
                    user.save().then(function(elem){
                      userModel.findOne({username:req.session.passport.user}).then(function(user){
                        res.redirect("back")
                      })
                    })
                  })
                })
            }
          }
        });
      }
    });
  });
});

// router.get("/following/:id" , async function(req, res){
//   try {
//     const id = req.params.id;
//     const data = await userModel.findById(id).exec();
//     const loggedin = await userModel.findOne({username : req.session.passport.user})
//     if (!loggedin.following.includes(id)) {
//         loggedin.following.push(id);
//         await loggedin.save();
        
//         data.follower.push(loggedin._id)
//         await data.save();
        
//         // res.status(200).json("now you are following " + data.name)
//         console.log("done")
//     }
//     else {
//         console.log("already  followed")
//     }

// } catch (error) {
//     res.status(500).json(error)
// }
// })

  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    else{
      res.redirect("/login")
    }
  }


router.get("/story/:id",isLoggedIn , function(req,res){
 userModel.findOne({_id:req.params.id}).populate("story")
 .then(function(story){
  userModel.find().populate("story")
  .then(function(all){
    res.render("story",{story:story,all:all})

  })
 })
  // const {story} = await userModel.findOne({_id:req.params.id}).populate("story").exec()
  // console.log(story)
  // res.render("story" , {story : story})
})  


router.post("/comment/:id" , async (req, res , next ) => 
{
    try {
        const loggedinuser = await userModel.findOne({username : req.session.passport.user})
        const comment = new Comment({ ...req.body, author: loggedinuser._id })
        await comment.save()
        const id = req.params.id;

        const data = await postModel.findById(id).exec();
        data.comment.push(comment._id)
        await data.save();
        console.log("commit done")
        res.redirect("back")
    } catch (error) {
        console.log(error)
    }
}
)

router.get("/search/:value", async function(req, res) {
  const regex = new RegExp(req.params.value, "i");
  const users = await userModel.find({ $or: [ { name: regex }, { username: regex } ] });
  res.json({ avail: users});
});

router.get("/search",isLoggedIn,async function(req,res){
var loggedInuser = await  userModel.findOne({username:req.session.passport.user})
res.render("search",{loggedInuser:loggedInuser})
})
  // cron.schedule('0 0 * * *', async () => {
  //   try {
  //     const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  //     await storyModel.deleteMany({ createdAt: { $lt: cutoffDate } });
  //     console.log('Deleted old statuses');
  //   } catch (err) {
  //     console.error(err);
  //   }
  // });
  
  cron.schedule('0 0 * * *', async () => {

      const cutoffDate = new Date(Date.now() -  24 * 60 * 60 * 1000); // 2 minutes in milliseconds
    var stor =   await storyModel.find({ createdAt: { $lt: cutoffDate } })
// console.log(stor)
stor.forEach(async function(elem){
  elem.imgs.forEach(function(id){
    cloudinary.uploader.destroy(id.publicid, { resource_type: id.type } , function(error, result) {
      if (error) {
        console.log('Error deleting video:', error);
      } else {
        console.log('Video deleted:', result);
      }
    });
  })
  var user = await userModel.findOne({_id:elem.userid})
  var pr =   user.story.indexOf(elem._id)
          user.story.splice(pr,1)
user.save().then(function(){})
await storyModel.findOneAndDelete({_id:elem._id})
console.log("delete")
})
// var s = await storyModel.find()
// console.log(s)

      // await storyModel.delete({ createdAt: { $lt: cutoffDate } });
      // console.log('Deleted old statuses')//;

  });
  
  router.delete("/del/:id", async function (req, res) {
    try {
      const messageId = req.params.id;
      const deletedMessage = await chatModel.findByIdAndDelete(messageId);
  
      if (!deletedMessage) {
        return res.status(404).json({ success: false, msg: "Message not found." });
      }

    

      res.json({ success: true, data: deletedMessage });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ success: false, msg: "Error deleting message." });
    }
  });


module.exports = router;
