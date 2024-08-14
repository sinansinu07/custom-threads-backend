const {Schema,model} = require('mongoose')
const userSchema = new Schema({
    username:String,
    email:String,
    phone:{
        number: String,
        countryCode : String,
        isVerified:{type:Boolean,default:false},
        otp:Number
    },
    password:String,
    role:String,
    verificationToken:String,
    jwtToken:{
        type:String,
        default:null
    },
    isVerified:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const User = model('User',userSchema)
module.exports = User
