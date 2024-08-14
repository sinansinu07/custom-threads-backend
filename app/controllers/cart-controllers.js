const { validationResult } = require('express-validator')
const Cart = require('../models/cart-model')
const Product = require('../models/product-model')
const Design = require('../models/design-model')

const cartCltr = {}

cartCltr.create = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ error : errors.array() })
    }
    const body = req.body
    const cartObj = {...body}
    console.log("cart Obj", cartObj)
    try {
        cartObj.customer = req.user.id
        const designIds = cartObj.lineItems.map((ele) => ele.design)
        // console.log(designIds)
        // const designs = await Design.find({ _id : [...designIds] })
        const designs = []
        for(let i = 0; i < designIds.length; i++){
            const design = await Design.findOne({ _id : designIds[i]})
            // console.log(design)
            designs.push(design)
        }
        // console.log(designs)
        for(let i = 0; i < designs.length; i++){
            const userProduct = await Product.findOne({ _id : designs[i].product })
            const customizationAmount = designs[i].customization.reduce((acc, cv) => {
                return acc + cv.amount
            }, 0)
            cartObj.lineItems[i].price = userProduct.price + designs[i].charges + customizationAmount
        }

        cartObj.totalAmount = cartObj.lineItems.reduce((acc, cv) => {
            return acc + cv.quantity * cv.price
        }, 0)
        
        const oldCart = await Cart.findOne({ customer : req.user.id })

        const oldCartAmount = oldCart && oldCart.totalAmount
        // console.log(cartObj)
        if(oldCart) {
            // console.log("cartObj", cartObj)
            // console.log("oldCart", oldCart)
            const oldLineItems = oldCart.lineItems.find((ele) => ele.design == cartObj.lineItems[0].design)
            if(oldLineItems) {
                console.log("Increment quantity of the same LineItem")
                oldCart.lineItems.forEach((ele) => {
                    if(ele.design == cartObj.lineItems[0].design) {
                        ele.quantity += 1
                    }
                })
                oldCart.totalAmount = oldCart.lineItems.reduce((acc, cv) => {
                    return acc + cv.quantity * cv.price
                }, 0)
                // console.log("changed Old cart", oldCart)
                await oldCart.save()
                const newCart = await Cart.findById(oldCart._id)
                    .populate({path : 'lineItems.design',populate : { path  : 'product', select : 'name'}, select : ['product','designName', 'color', 'size']})
                        .populate('customer', ['userName', 'email'])
                res.status(200).json(newCart)
            } else {
                console.log("Add items to lineItems")
                // console.log(oldCart)
                // console.log(cartObj)
                for(let i = 0; i < cartObj.lineItems.length ; i++) {
                    oldCart.lineItems.push(cartObj.lineItems[i])
                    oldCart.totalAmount = cartObj.totalAmount + oldCartAmount
                }
                // console.log(oldCart)
                await oldCart.save()
                const newCart = await Cart.findById(oldCart._id)
                    .populate({path : 'lineItems.design',populate : { path  : 'product', select : 'name'}, select : ['product','designName', 'color', 'size']})
                        .populate('customer', ['userName', 'email'])
                res.status(200).json(newCart)
                console.log(newCart)
            }
        } else {
            console.log("create new Cart")
            const cart = await Cart.create(cartObj)
            const newCart = await Cart.findById(cart._id)
                .populate({path : 'lineItems.design',populate : { path  : 'product', select : 'name'}, select : ['product','designName', 'color', 'size']})
                    .populate('customer', ['userName', 'email'])
            res.status(200).json(newCart)
        }
        
    } catch(err) {
        res.status(500).json('internal server error')
        console.group(err)
    }
}

cartCltr.myCart = async (req, res) => {
    const id = req.user.id
    // console.log(id)
    try {
        const cart = await Cart.findOne({ customer : id })
            .populate({path : 'lineItems.design',populate : { path  : 'product', select : 'name'}, select : ['product','designName', 'color', 'size','frontImage']})
                .populate('customer', ['userName', 'email'])
        res.status(200).json(cart)
    } catch(err) {
        res.status(500.).json('internal server error')
    }
}

cartCltr.emptyCart = async (req, res) => {
    const id = req.user.id
    // console.log(id)
    try {
        const cart = await Cart.findOneAndDelete({ customer : id })
        res.status(200).json(cart)
    } catch(err) {
        res.status(500.).json('internal server error')
    }
}

cartCltr.incQty = async (req, res) => {
    const designId = req.params.id
    try {
        const cart = await Cart.findOne({ customer : req.user.id })
        // console.log(cart)
        cart.lineItems.forEach((ele) => {
            if(ele._id == designId) {
                ele.quantity ++
                // console.log("design found")
            }
        })
        cart.totalAmount = cart.lineItems.reduce((acc, cv) => {
            return acc + cv.quantity * cv.price
        }, 0)

        // console.log(cart)
        await cart.save()
        const newCart = await Cart.findById(cart._id)
            .populate({path : 'lineItems.design',populate : { path  : 'product', select : 'name'}, select : ['product','designName', 'color', 'size']})
                .populate('customer', ['userName', 'email'])
        res.status(200).json(newCart)
    } catch(err) {
        res.status(500.).json('internal server error')
    }
}

cartCltr.decQty = async (req, res) => {
    const designId = req.params.id
    try {
        const cart = await Cart.findOne({ customer : req.user.id })
        // console.log(cart)
        cart.lineItems.forEach((ele) => {
            if(ele._id == designId) {
                ele.quantity --
                // console.log("design found")
            }
        })
        cart.totalAmount = cart.lineItems.reduce((acc, cv) => {
            return acc + cv.quantity * cv.price
        }, 0)

        // console.log(cart)
        await cart.save()
        const newCart = await Cart.findById(cart._id)
            .populate({path : 'lineItems.design',populate : { path  : 'product', select : 'name'}, select : ['product','designName', 'color', 'size']})
                .populate('customer', ['userName', 'email'])
        res.status(200).json(newCart)
    } catch(err) {
        res.status(500.).json('internal server error')
    }
}

cartCltr.removeLineItem = async (req, res) => {
    const designId = req.params.id
    try {
        const cart = await Cart.findOne({ customer : req.user.id })
        // console.log(cart)
        const newArr = cart.lineItems.filter((ele) => ele._id != designId)
        // console.log(newArr)
        cart.lineItems = newArr
        cart.totalAmount = cart.lineItems.reduce((acc, cv) => {
            return acc + cv.quantity * cv.price
        }, 0)
        // console.log(cart)
        await cart.save()
        const newCart = await Cart.findById(cart._id)
            .populate({path : 'lineItems.design',populate : { path  : 'product', select : 'name'}, select : ['product','designName', 'color', 'size','frontImage']})
                .populate('customer', ['userName', 'email'])
        res.status(200).json(newCart)
    } catch(err) {
        res.status(500.).json('internal server error')
    }
}

module.exports = cartCltr

// cartCltr.create = async (req, res) => {
//     const { body } = req
//     try {
//         const cart = new Cart(body)
//         cart.customer = req.user.id
//         cart.design = req.params.designId
//         await cart.save()
//         const newCart = await Cart.findById(cart._id)
//             .populate({path : 'design',populate : { path  : 'product', select : 'name'}, select : ['product','designName', 'color', 'size']})
//                 .populate('customer', ['username', 'email'])
//         const userProduct = await Product.findOne({ _id : newCart.design.product })
//         // console.log(userProduct)
//         const userDesign = await Design.findOne({ _id : newCart.design._id })
//         // console.log(userDesign)
//         const CustomizationAmount = userDesign.customization.reduce((acc, cv) => {
//             return acc + cv.amount
//         }, 0)
//         console.log(CustomizationAmount)
//         const amount = userProduct.price + userDesign.charges + CustomizationAmount
//         newCart.totalAmount = amount
//         console.log(amount)
//         res.status(200).json(newCart)
//     } catch(err) {
//         res.status(500.).json('internal server error')
//     }
// }