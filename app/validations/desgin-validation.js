const Design = require('../models/design-model')
const designValidationSchema = {
    size:{
        notEmpty:{
            errorMessage:"size is required"
        },
        isMongoId:{
            errorMessage:'please provide a valid sizeId'
        }
    },
    color:{
        notEmpty:{
            errorMessage:"color is required"
        },
        isMongoId:{
            errorMessage:'please provide a valid colorId'
        }
    },
    designName:{
        notEmpty:{
            errorMessage:'design name is required'
        }
    }
}
module.exports = designValidationSchema