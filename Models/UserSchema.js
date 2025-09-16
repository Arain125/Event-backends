
const { Schema, default: mongoose } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
   
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum:["attendee","organizer","exhibitor"],
        default: 'attendee',
        required: true
    },
    queryAnswer:{
        type:String,
        required:true
    },
    resetToken: String,
    resetTokenExpiry: Date
})

const userModel = mongoose.model("user",userSchema)
module.exports = userModel