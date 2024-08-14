const User = require('../models/user-model')
const roles = require('../../utils/roles')
const registerValidationSchema = {
    username:{
        notEmpty:{
            errorMessage:'username is required'
        },
    },
    email:{
        notEmpty:{
            errorMessage:'email is required'
        },
        isEmail:{
            errorMessage:'invalid email'
        },
        custom:{
            options : async function (value){
                const user = await User.findOne({email:value})
                if(!user){
                    return true
                }else{
                    throw new Error('email already exist')
                }
            }
        },
        trim:true,
        normalizeEmail:true
    },
    'phone.number':{
        notEmpty:{
            errorMessage: "Phone number is required" 
        },
        custom:{
            options : async function (value){
                const user = await User.findOne({'phone.number':value})
                if(!user){
                    return true
                }else{
                    throw new Error('phone already exist')
                }
            }
        }
    },
    'phone.countryCode':{
        notEmpty:{
            errorMessage: "Country Code is required" 
        }
    },
    password:{
        notEmpty:{
            errorMessage:'password is required'
        },
        isLength:{
            options:{min:8,max:120},
            errorMessage:'password must be between 8 and 120 characters long'
        }
    }
}

const  loginValidationSchema={
    username:{
        notEmpty:{
            errorMessage: 'email or phone is required'
        },
        trim:true,
    },
    password:{
        notEmpty:{
            errorMessage:'password is required'
        },
        isLength:{
            options:{min:8,max:120},
            errorMessage:'password must be between 8 and 120 characters long'
        },
        trim:true
    }
}

const changeUsernameValidationSchema = {
    username:{
        notEmpty:{
            errorMessage: 'username is required'
        },
        custom:{
            options : async function (value){
                const user = await User.findOne({'username':value})
                if(!user){
                    return true
                }else{
                    throw new Error('Username already exist')
                }
            }
        }
    }
}

const changeEmailValidationSchema = {
    email:{
        notEmpty:{
            errorMessage: 'email is required'
        },
        trim:true,
        custom:{
            options : async function (value){
                const user = await User.findOne({'email':value})
                if(!user){
                    return true
                }else{
                    throw new Error('email already exist')
                }
            }
        }
    }
}

const changePhoneValidationSchema = {
    'phone.number':{
        notEmpty:{
            errorMessage: 'number is required'
        },
        trim:true,
        custom:{
            options : async function (value){
                const user = await User.findOne({'phone.number':value})
                if(!user){
                    return true
                }else{
                    throw new Error('phone number already exist')
                }
            }
        }
    }
}

module.exports ={
    registerValidationSchema,
    loginValidationSchema,
    changeUsernameValidationSchema,
    changeEmailValidationSchema,
    changePhoneValidationSchema
}