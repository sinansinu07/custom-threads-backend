const express = require('express')
const router = express.Router()
const designCtrl = require('../controllers/design-controller')
const {checkSchema} = require("express-validator")
const designValidationSchema = require('../validations/desgin-validation')
const {authenticateUser,authorizeUser} = require('../middlewares/auth')
const roles = require('../../utils/roles')

router
    .route('/:productId')
        .post(authenticateUser,authorizeUser([roles.customer]),checkSchema(designValidationSchema),designCtrl.createDesign)
router
    .route('/')
        .get(authenticateUser,authorizeUser([roles.customer]),designCtrl.getMyDesigns)
router
    .route('/:id')
        .get(authenticateUser,authorizeUser([roles.customer]),designCtrl.getOneDesign)
        .delete(authenticateUser, authorizeUser([roles.customer]),designCtrl.deleteDesign)
        .put(authenticateUser,authorizeUser([roles.customer]),designCtrl.updateDesign)
module.exports = router
