const express = require('express')
const router = express.Router()
const productCltr=require('../controllers/product-controller')
const {checkSchema} = require("express-validator")
const productValidationSchema = require('../validations/product-validation')

router
    .route('/:categoryId')
        .get(productCltr.getCategoryProducts)
        .post(checkSchema(productValidationSchema),productCltr.createProduct)
router
    .route('/:id')
        .delete(productCltr.delete)
router
    .route('/:categoryId/:id')
        .put(checkSchema(productValidationSchema),productCltr.updateProduct)
        
module.exports= router
