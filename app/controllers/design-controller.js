const Design = require('../models/design-model')
const Customer = require('../models/user-model')
const Product= require('../models/product-model')
const {validationResult} = require('express-validator')
const cloudinary = require('../../config/cloudinary')
const _ = require('lodash')

const designCtrl = {}

designCtrl.createDesign = async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    const body  = _.pick(req.body,['designName'])
    const files = req.files.customization
    const optionsStored =JSON.parse (req.body.options)
    console.log(optionsStored)
    const amountStored = optionsStored.map((option) => option.height * option.width * 1.5);
    
    const colorId = req.body.color;
    const sizeId = req.body.size;

    const imageOne = req.files.frontImage
    const imageTwo = req.files.backImage

    const product = await Product.findOne({
        $or: [{ 'colors._id': colorId }, { 'sizes._id': sizeId }],
    });
   
    const productColor = product.colors.find((c) => c._id.toString() === colorId);
    const productSize = product.sizes.find((s) => s._id.toString() === sizeId);
    console.log(productColor,productSize)
    if (!productColor ||!productSize) {
        return res.status(404).json({ message: 'Color or size not found' });
    }

    const design = new Design(body)
    try{
        const result  = await Promise.all(files.map(file=>cloudinary.uploader.upload(file.tempFilePath,{
            folder:'Design'
        })))
        // console.log(result)
        design.customization = result.map((image,i)=>{
            return {
                image_url:image.secure_url,
                options:optionsStored[i],
                amount:amountStored[i]
            }
        })

        const resultOne = await cloudinary.uploader.upload(imageOne.tempFilePath,{
            folder: "products"
        })
        design.frontImage = {image_url:resultOne.secure_url}

        const resultTwo = await cloudinary.uploader.upload(imageTwo.tempFilePath,{
            folder: "products"
        })
        design.backImage = {image_url:resultTwo.secure_url}
        console.log('backImage', resultTwo)
       
        design.color = { colorName: productColor.color, _id: colorId }
        design.size = { sizeName: productSize.size, _id: sizeId }
        
        design.customer=req.user.id
        design.product=req.params.productId
        
        const designObj = await design.save()
        
        const newDesign = await Design.findById(designObj._id)
            .populate({path:'product',populate:{path:'category',select:'name'},select:'name'})
                .populate('customer',['userName'])
        res.status(201).json(newDesign)
    }catch(err){
        res.status(500.).json('internal servr error')
    }
}

designCtrl.getMyDesigns = async(req,res)=>{
    try{
        const designs = await Design.find({customer:req.user.id})
            .populate({path:'product',populate:{path:'category',select:'name'},select:'name price'})
                .populate('customer',['userName'])
        res.status(201).json(designs)
    }catch(err){
        res.status(500).json('internal server error')
    }
}

designCtrl.getOneDesign = async(req,res)=>{
    try{
        const design = await Design.findById(req.params.id)
            .populate({path:'product',populate:{path:'category',select:'name'},select:'name'})
                .populate('customer',['userName'])
        res.status(201).json(design)
    }catch(err){
        res.status(500).json('internal server error')
    }
}

designCtrl.deleteDesign = async(req,res)=>{
    try{
        const design = await Design.findByIdAndDelete(req.params.id);
        res.status(201).json(design)
    }catch(err){
        res.status(500).json("internal server error")
    }
}

designCtrl.updateDesign=async (req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    const body  = _.pick(req.body,['size','color','designName'])
    const files = req.files.customization
    const optionsStored = req.body.options
    const amountStored = req.body.amount
    const design = await Design.findByIdAndUpdate(req.params.id,body,{new:true})
    try{
        const result  = await Promise.all(files.map(file=>cloudinary.uploader.upload(file.tempFilePath,{
            folder:'Design'
        })))
        design.customization = result.map((image,i)=>{
            return {
                image_url:image.secure_url,
                options:optionsStored[i],
                amount:amountStored[i]
            }
        })
        design.customer=req.user.id
        design.product=req.params.productId
        console.log(design)
        const designObj = await design.save()
        const newDesign = await Design.findById(designObj._id)
            .populate({path:'product',populate:{path:'category',select:'name'},select:'name'})
                .populate('customer',['userName'])
        res.status(201).json(newDesign)
    }catch(err){
        res.status(500.).json('internal servr error')
    }
}
module.exports=designCtrl;