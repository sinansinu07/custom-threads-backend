const Product = require('../models/product-model');
const {validationResult} = require('express-validator')
const cloudinary = require('../../config/cloudinary')
const _ = require('lodash');
const productCltr= {}

// Get all products
productCltr.getCategoryProducts = async(req,res)=>{
    try{
        const products = await Product.find({category:req.params.categoryId}).populate('category',[ 'name','price','_id' ]);
        res.status(200).json(products)
    }catch(err){
        res.status(500).json('internal server error')
    }
}

// create product
productCltr.createProduct = async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()})
    }
    const body = _.pick(req.body,['name','description','price',])
    const sizesStored = (req.body.sizes).split(',')
    const colorsStored = (req.body.colors ).split(',')
    console.log('Colors',colorsStored, 'Sizes',sizesStored);
    const product = new Product(body)
    product.category=req.params.categoryId
    const imageOne = req.files.frontImage
    const imageTwo = req.files.backImage
    console.log(imageOne)
    console.log(imageTwo)
    try{
        const resultOne = await cloudinary.uploader.upload(imageOne.tempFilePath,{
            folder: "products"
        })
        product.frontImage = {image_url:resultOne.secure_url}

        const resultTwo = await cloudinary.uploader.upload(imageTwo.tempFilePath,{
            folder: "products"
        })
        product.backImage = {image_url:resultTwo.secure_url}
        
        product.colors=colorsStored.map((ele)=>{
            return {color : ele};
        })
        product.sizes=sizesStored.map((ele)=>{
            return  {size : ele };
        })
        console.log(product)

        const productObj = await product.save()
        const newProduct = await Product.findById(productObj._id).populate
        ('category',['name','price','_id'])
        res.status(201).json(newProduct)
        
    }catch(err){
        res.status(500).json('internal server error')
    }
}

// update product
productCltr.updateProduct = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() })
    }
    const body = _.pick(req.body, ['name', 'description', 'price'])
    const sizesStored = (req.body.sizes).split(',')
    const colorsStored = (req.body.colors ).split(',')
    const product = await Product.findById(req.params.id)
    product.category=req.params.categoryId
    const imageOne = req.files.frontImage
    const imageTwo = req.files.backImage
    const {files} = req
    try{
        if (files && files.frontImage) {
            const resultOne = await cloudinary.uploader.upload(imageOne.tempFilePath,{
                folder: "products"
            })
            body.frontImage = { image_url: resultOne.secure_url }
        }
        if (files && files.backImage) {
            const resultTwo = await cloudinary.uploader.upload(imageTwo.tempFilePath,{
                folder: "products"
            })
            body.backImage = { image_url: resultTwo.secure_url }
        }
      // assign image urls to the model 
      
      product.colors=colorsStored.map((ele)=>{
        return {color : ele};
      })
        product.sizes=sizesStored.map((ele)=>{
        return  {size : ele };
      })
      const productObj = await Product.findByIdAndUpdate(req.params.id, body, { new: true })
      const updatedProduct = await Product.findById(productObj._id).populate
      ('category',['name','price','_id'])
      res.status(201).json(updatedProduct)
    }
    catch(err){
        res.status(500).json('internal  server error');
    }
  }

productCltr.delete = async(req,res)=>{
    const id = req.params.id
    try{
        const product = await  Product.findByIdAndDelete(id)
        res.status(200).json(product)
    }catch(err){
        res.status(500).json('internal server error')
    }
}
module.exports = productCltr