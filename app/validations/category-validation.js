
const Category = require('../models/category-model')

const categoryCreateValidationSchema = {
    name : {
        notEmpty : {
            errorMessage:'Category name is required'
        },
        custom : {
            options : async function (value){
                const category = await Category.findOne({name:value})
                if(!category){
                    return true
                }else{
                    throw new Error('Category name already exist')
                }
            }
        }
    }
}
const categoryUpdateValidationSchema = {
    name : {
        notEmpty : {
            errorMessage:'Category name is required'
        }
    }
}

module.exports = {categoryCreateValidationSchema,categoryUpdateValidationSchema}