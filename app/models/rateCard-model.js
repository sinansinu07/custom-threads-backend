const mongoose = require('mongoose')
const { Schema, model } = mongoose

const rateCardSchema = ({
    name : String,
    amount : Number
})

const RateCard = model('RateCard', rateCardSchema)

module.exports = RateCard