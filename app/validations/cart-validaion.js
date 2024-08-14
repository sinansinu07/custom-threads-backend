const cartValidationSchema = {
    'lineItems.*.design' : {
        notEmpty : {
            errorMessage : 'Design is required'
        },
        isMongoId:{
            errorMessage: "Please provide a valid Design Id"
        }
    },
    'lineItems.*.quantity' : {
        notEmpty : {
            errorMessage : 'Design qty is required'
        },
        isNumeric:{
            errorMessage: "Design qty should be a numeric value"
        }
    },
}

module.exports = cartValidationSchema