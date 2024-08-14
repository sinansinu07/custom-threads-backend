const express = require('express')
const { checkSchema } = require('express-validator')
const router = express.Router()

const cartValidationSchema = require('../validations/cart-validaion')
const cartCltr = require('../controllers/cart-controllers')
const { authenticateUser, authorizeUser } = require('../middlewares/auth')


router
    .route('/')
        .post(authenticateUser, checkSchema(cartValidationSchema), authorizeUser('customer'), cartCltr.create)
        .get(authenticateUser, authorizeUser('customer'), cartCltr.myCart)
        .delete(authenticateUser, authorizeUser('customer'), cartCltr.emptyCart)
router
    .route('/inc/:id')
        .put(authenticateUser, authorizeUser('customer'), cartCltr.incQty)
router
    .route('/dec/:id')
        .put(authenticateUser, authorizeUser('customer'), cartCltr.decQty)
router
    .route('/:id')
        .delete(authenticateUser, authorizeUser('customer'), cartCltr.removeLineItem)
        
module.exports = router