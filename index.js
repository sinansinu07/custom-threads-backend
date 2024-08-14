require ('dotenv').config()
const express = require('express');
const fileupload = require('express-fileupload'); 
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000
const configureDB = require('./config/db')
const {checkSchema} = require('express-validator')

const {authenticateUser, authorizeUser} = require('./app/middlewares/auth')

const userCtrl = require('./app/controllers/user-controller')
const categoryCltr = require('./app/controllers/category-controller')


const { registerValidationSchema,loginValidationSchema, changeUsernameValidationSchema,changeEmailValidationSchema,changePhoneValidationSchema } = require('./app/validations/user-validation');
const {categoryCreateValidationSchema,categoryUpdateValidationSchema} = require('./app/validations/category-validation');

configureDB()
app.use(cors())
app.use(express.json())
app.use(fileupload({useTempFiles: true}))

// User controllers

app.post('/api/user/register', checkSchema(registerValidationSchema), userCtrl.register)
app.post('/api/user/login', checkSchema(loginValidationSchema), userCtrl.login)
app.get('/api/user/account', authenticateUser, userCtrl.account)

app.post('/api/user/sendOtp', authenticateUser, userCtrl.sendOtp)
app.post('/api/user/verifyOtp', authenticateUser, userCtrl.verifyOtp)
app.post('/api/user/changePassword', authenticateUser, userCtrl.changePassword)

app.post('/api/user/forgotPassword', userCtrl.fPSendOtp)
app.post('/api/user/newPassword', userCtrl.fPVerifyOtpAndChangePassword)

app.post('/api/user/verifyLink', authenticateUser, userCtrl.verifyLink)
app.get('/verify/:token', userCtrl.verifyEmail)

app.put('/api/user/changeUsername', authenticateUser, authorizeUser(['customer']),checkSchema(changeUsernameValidationSchema), userCtrl.changeUsername)
app.put('/api/user/changeEmail', authenticateUser, authorizeUser(['customer']),checkSchema(changeEmailValidationSchema), userCtrl.changeEmail)
app.post('/api/user/changePhoneSendOTP', authenticateUser, authorizeUser(['customer']), userCtrl.changePhoneSendOTP)
app.post('/api/user/changePhoneVerifyOTP', authenticateUser, authorizeUser(['customer']), userCtrl.VerifyOtpAndChangePhone)

// Category Controllers
app.post('/api/categories', checkSchema(categoryCreateValidationSchema), categoryCltr.create)

app.get('/api/categories', categoryCltr.list)

app.put('/api/categories/:id', checkSchema(categoryUpdateValidationSchema), categoryCltr.update)

app.delete('/api/categories/:id', categoryCltr.delete)

// product routes

// app.post('/api/products',checkSchema(productValidationSchema), productCltr.createProduct)
const productRoute= require('./app/routes/product-routes')
app.use('/api/products',productRoute)

// design routes
const designRoute = require('./app/routes/design-routes')
app.use( '/api/designs' , designRoute )

// address routes
const addressRoute = require('./app/routes/address-routes')
app.use('/api/user/address', addressRoute)

// cart routes
const cartRoutes = require('./app/routes/cart-routes')
app.use('/api/user/cart', cartRoutes)

// Payment routes
const paymentRoutes = require('./app/routes/payment-routes')
app.use('/api/user/payment', paymentRoutes)

// order routes
const orderRoutes = require('./app/routes/order-routes')
app.use('/api/user/order', orderRoutes)

app.listen(port,()=>{
    console.log(`listening to port ${port}` )
})