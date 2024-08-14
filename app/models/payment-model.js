const mongoose = require('mongoose')
const { Schema, model } = mongoose

const paymentSchema = new Schema  ({
    cart : {
        type : Schema.Types.ObjectId,
        ref : 'Cart'
    },
    transactionId :  {
        type: String,
        default: null
    },
    amount : Number,
    customer : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    paymentType : String,
    paymentStatus : {
        type : String,
        enum : ['Pending', 'Successful', 'Failed'],
        default : "Pending"
    }
}, { timestamps: true })

const Payment = model('Payment', paymentSchema)

module.exports = Payment