const express = require('express')
const { checkSchema } = require('express-validator')
const router = express.Router()

const orderCltr = require('../controllers/order-controller')
const { authenticateUser, authorizeUser } = require('../middlewares/auth')

router
    .route('/:id')
        .post(authenticateUser, authorizeUser('customer'), orderCltr.create)
        .put(authenticateUser, authorizeUser(['customer']), orderCltr.cancelOrder)
router
    .route('/allOrders')
        .get(authenticateUser, authorizeUser('admin'), orderCltr.listOrders)
router
    .route('/myOrders')
        .get(authenticateUser, authorizeUser('customer'), orderCltr.getMyOrders)


module.exports = router