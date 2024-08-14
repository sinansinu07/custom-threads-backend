const Address = require('../models/address-model')
const { validationResult } = require('express-validator')
const { populate } = require('../models/user-model')

const addressCltr = {}

addressCltr.create = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ error : errors.array() })
    }
    const { body } = req
    try {
        const address = new Address(body)
        address.user = req.user.id
        const addresses = await Address.find({ user : req.user.id })
        if(addresses.length === 0) {
            address.isDefault = true
        } else {
            address.isDefault = false
        }
        await address.save()
        const newAddress = await Address.findById(address._id).populate('user', ['username', 'email'])
        res.status(200).json(newAddress)
        console.log(newAddress)
    } catch(err) {
        res.status(500).json({error:'internal server error'})
    }
}

addressCltr.myAddresses = async(req, res) => {
    try {
        const addresses = await Address.find({ user : req.user.id }).sort({ createdAt : -1 })
        res.status(200).json(addresses)
    } catch(err) {
        res.status(500).json({error:'internal server error'})
    }
}

addressCltr.delete = async (req, res) => {
    const id = req.params.id
    try {
        const address = await Address.findOneAndDelete({ _id : id, user : req.user.id })
        res.status(200).json(address)
        // console.log(address)
    } catch(err) {
        res.status(500).json({error:'internal server error'})
    }
}

addressCltr.update = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ error : errors.array() })
    }
    const id = req.params.id
    const { body } = req
    try {
        const address = await Address.findOneAndUpdate({ _id : id, user : req.user.id }, body, { new : true})
        res.status(200).json(address)
        // console.log(address)
    } catch(err) {
        res.status(500).json({error:'internal server error'})
    }
}
addressCltr.setDefault = async (req, res) => {
    const id = req.params.id
    try {
        const addresses = await Address.find({ user : req.user.id })
        // console.log("old addresses", addresses)
        addresses.map( async (address) =>{
            if(address._id == id) {
                address.isDefault = true
                await address.save()
            } else {
                address.isDefault = false
                await address.save()
            }
        })
        res.status(200).json(addresses)
        // console.log("new addresses", addresses)
    } catch(err) {
        res.status(500).json({error:'internal server error'})
    }
}

module.exports = addressCltr