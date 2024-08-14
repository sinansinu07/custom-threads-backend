const rateCardValidationSchema = {
    name : {
        notEmpty : {
            errorMessage : 'Name is required'
        }
    },
    amount : {
        notEmpty : {
            errorMessage : 'Amount is required'
        },
        isNumeric : {
            errorMessage : 'Amount should be a Numeric value'
        }
    }
}

module.exports = rateCardValidationSchema