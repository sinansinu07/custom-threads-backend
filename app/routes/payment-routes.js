const express = require('express')
const { checkSchema } = require('express-validator')
const router = express.Router()

const paymentValidationSchema = require('../validations/payment-validation')
const paymentsCltr = require('../controllers/payment-controller')
const { authenticateUser, authorizeUser } = require('../middlewares/auth')

router
    .route('/')
        .post(authenticateUser, authorizeUser('customer'), checkSchema(paymentValidationSchema), paymentsCltr.payment)
router
    .route('/:id/success')
        .put(authenticateUser, authorizeUser('customer'), paymentsCltr.successUpdate)
router
    .route('/:id/failed')
        .put(authenticateUser, authorizeUser('customer'), paymentsCltr.failedUpdate)

module.exports = router