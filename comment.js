const mongoose = require("mongoose")

const commentModel = new mongoose.Schema({
    comment : {
        type : "String",
    },
    author : {
        type : mongoose.Schema.Types.ObjectId , ref : 'user'
    },
    
}, {timestamps : true})


const comment = mongoose.model("comment" , commentModel)
// validator is used to check a string as per our conditions 

module.exports = comment;


