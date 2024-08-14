const Category = require('../models/category-model')
const{ validationResult } = require('express-validator')
const cloudinary = require('../../config/cloudinary')
const _ = require('lodash')

const categoryCltr = {}

categoryCltr.create = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ error : errors.array() })
    }
    const  body  = _.pick(req.body, ['name'])
    const file = req.files.image
    try {
        const category = new Category(body)
        const result = await cloudinary.uploader.upload(file.tempFilePath,{
            folder: "categories"
        })
        category.image = {image_url:result.secure_url}
        await category.save()
        res.status(200).json(category)
    } catch(err) {
        res.status(500).json({error:'internal server error'})
    }
}

categoryCltr.list = async (req, res) => {
    try {
        const categories = await Category.find()
        res.status(200).json(categories)
    } catch(err) {
        res.status(500).json({error:'internal server error'})
    }
}

// categoryCltr.update = async (req, res) => {
//     const errors = validationResult(req)
//     if(!errors.isEmpty()) {
//         return res.status(400).json({ error : errors.array() })
//     }

//     const id = req.params.id
//     const { body,files } = req

//     try {
//         const category = await Category.findByIdAndUpdate({_id : id}, body, { new : true })
//         res.status(200).json(category)
//     } catch(err) {
//         res.status(500).json({error:'internal server error'})
//     }
// }

categoryCltr.update = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() })
    }

    const id = req.params.id
    const { body, files } = req

    try {
        if (files && files.image) {
            const result = await cloudinary.uploader.upload(files.image.tempFilePath, {
                folder: "categories"
            })
            body.image = { image_url: result.secure_url }
        }

        const category = await Category.findByIdAndUpdate({_id: id}, body, { new: true })
        res.status(200).json(category)
    } catch (err) {
        res.status(500).json({error:'internal server error'})
    }
}

categoryCltr.delete = async (req, res) => {
    const id = req.params.id
    try {
        const category = await Category.findByIdAndDelete({_id : id})
        res.status(200).json(category)
    } catch(err) {
        res.status(500).json({error:'internal server error'})
    }
}

module.exports = categoryCltr