var mongoose = require('mongoose');

 


var storySchema = mongoose.Schema({
 userid : {type:mongoose.Schema.Types.ObjectId,ref:"user"},
 imgs:[],
  createdAt: {
    type: Date,
    default: Date.now
  }
})



module.exports = mongoose.model("story",storySchema)