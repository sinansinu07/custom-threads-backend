const Product = require('../models/product-model')
const productValidationSchema ={
    name:{
        notEmpty:{
            errorMessage:'product name is required'
        },
        custom:{
            options:async function(value){
                const product =await Product.findOne({name: value})
                if(!product){
                    return true
                }
                else{
                    throw new Error('Product already exists');
                }
            }
        }
    },
    description:{
        notEmpty:{
            errorMessage: 'description is required'
        }
    },
    price:{
        notEmpty:{
            errorMessage: "Price can't be empty"
        }
    },
    sizes:{
        notEmpty:{
            errorMessage:'sizes should not be blank'
        }
    },
    'sizes.*.size':{
        notEmpty:{
            errorMessage: "Size can't be empty"
        },
        isIn:{
            options:[['S','M','L', 'XL']],
            errorMessage:"Invalid size"
        }
    },
    colors:{
        notEmpty:{
            errorMessage:'colors should not be blank'
        }
    },
    'colors.*.color':{
        notEmpty:{
            errorMessage:"colors field can't be left blank"
        }
    }
}
module.exports = productValidationSchema