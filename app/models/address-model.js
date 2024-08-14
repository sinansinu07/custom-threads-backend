const mongoose = require('mongoose')
const { Schema, model } = mongoose

const addressSchema = new Schema  ({
    name : String,
    addressNo : String,
    street : String,
    city : String,
    state : String,
    pincode : String,
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    isDefault : Boolean
}, { timestamps : true })

const Address = model('Address', addressSchema)
module.exports = Address