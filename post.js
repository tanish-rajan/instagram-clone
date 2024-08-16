var mongoose = require('mongoose');

 


var postSchema = mongoose.Schema({
 userid : {type:mongoose.Schema.Types.ObjectId,ref:"user"},
 imgs:[],
 caption : String,
 like:{
    type:Array,
    default:[]
  }
  ,comment: [{type : mongoose.Schema.Types.ObjectId , ref : 'comment'}]
})



module.exports = mongoose.model("post",postSchema)