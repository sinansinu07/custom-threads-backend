const express = require('express')
const { checkSchema } = require('express-validator')
const router = express.Router()

const addressValidationSchema = require('../validations/address-validation')
const addressCltr = require('../controllers/address-controller')
const { authenticateUser, authorizeUser } = require('../middlewares/auth')

router
    .route('/')
        .post(authenticateUser,authorizeUser(['customer']), checkSchema(addressValidationSchema), addressCltr.create)
        .get(authenticateUser,authorizeUser(['customer']), addressCltr.myAddresses)
router
    .route('/:id')
        .delete(authenticateUser,authorizeUser(['customer']), addressCltr.delete)
        .put(authenticateUser,authorizeUser(['customer']), checkSchema(addressValidationSchema), addressCltr.update)
router
    .route('/:id/setDefault')
        .put(authenticateUser, authorizeUser(['customer']), addressCltr.setDefault)

module.exports = router