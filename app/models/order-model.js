const mongoose = require('mongoose')
const { Schema, model } = mongoose

const orderSchema = new Schema ({
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
            quantity : Number,
            price : Number
        }
    ],
    totalAmount : Number,
    status : {
        type : String,
        enum : ['Placed', 'Canceled', 'Dispatched', 'Delivered'],
        default : "Placed"
    }
}, { timestamps : true })

const Order = model('Order', orderSchema)

module.exports = Order