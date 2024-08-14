const orderValidationSchema = {
    customer : {
        notEmpty : {
            errorMessage : 'Customer is required'
        },
        isMongoId:{
            errorMessage: "Please provide a valid Customer Id"
        }
    },
    'lineItems.*.design' : {
        notEmpty : {
            errorMessage : 'Design is required'
        },
        isMongoId:{
            errorMessage: "Please provide a valid Design Id"
        }
    },
    totalAmount : {
        notEmpty : {
            errorMessage : 'Total Amount is required'
        },
        isNumeric : {
            errorMessage : 'Total Amount should be a Numeric value'
        }
    },
    status : {
        notEmpty : {
            errorMessage : 'Status is required'
        },
    }
}