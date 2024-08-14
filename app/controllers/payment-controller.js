const Payment = require('../models/payment-model')
const Cart = require('../models/cart-model')
const { validationResult } = require('express-validator')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const {pick} = require('lodash')
const Design = require('../models/design-model')
const paymentsCltr={}

paymentsCltr.payment = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const body = pick(req.body,['cart','amount'])
    const cart = await Cart.findOne({customer : req.user.id})
    try{
        if(cart) {
             //create a customer
            const customer = await stripe.customers.create({
                name: "Testing",
                address: {
                    line1: 'India',
                    postal_code: '517501',
                    city: 'Tirupati',
                    state: 'AP',
                    country: 'US',
                },
            })
            
            //create a session object
            // console.log("cartLineItems", cart.lineItems)
            let designNames = await Promise.all(
                cart.lineItems.map(async (ele) => {
                const designId = String(ele.design);
                const design = await Design.findById(designId);
                return String(design.designName);
                })
            );
            // console.log("designNames", designNames)
            
            const lineItems = cart.lineItems.map((ele, i) => ({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: String(designNames[i]), // assuming design has a name property
                    },
                    unit_amount: Number(ele.price) * 100,
                },
                quantity: Number(ele.quantity),
            }))
            // console.log("sessionLineItems", lineItems)
            const session = await stripe.checkout.sessions.create({
                payment_method_types:["card"],
                line_items:lineItems,
                mode:"payment",
                success_url:"http://localhost:3000/customer-container",
                cancel_url: 'http://localhost:3000/cart',
                customer : customer.id
            })
            
            //create a payment
            const payment = new Payment(body)
            payment.customer = req.user.id
            payment.cart = cart._id
            payment.transactionId = session.id
            payment.amount = Number(cart.totalAmount)
            payment.paymentType = "card"
            await payment.save()
            res.json({id:session.id,url: session.url})
        } else {
            res.status(400).json({error: "Customer Cart is Empty" })
        }
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}

paymentsCltr.successUpdate=async(req,res)=>{
    try{
        const id = req.params.id
        const body = pick(req.body,['paymentStatus'])
        const updatedPayment = await Payment.findOneAndUpdate({transactionId:id}, body) 
        res.json(updatedPayment)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}

paymentsCltr.failedUpdate=async(req,res)=>{
    try{
        const id = req.params.id
        const body = pick(req.body,['paymentStatus'])
        const updatedPayment = await Payment.findOneAndUpdate({transactionId:id}, body) 
        res.json(updatedPayment)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}

module.exports = paymentsCltr