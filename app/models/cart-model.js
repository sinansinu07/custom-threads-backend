const mongoose = require('mongoose')
const { Schema, model } = mongoose

const cartSchema = new Schema  ({
    customer : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    lineItems : [
        {
            design : {
                type : Schema.Types.ObjectId,
                ref : 'Design'
            },
            quantity : {
                type : Number,
                default : 1
            },
            price : Number
        }
    ],
    totalAmount : Number
}, { timestamps : true })

const Cart = model('Cart', cartSchema)

module.exports = Cart