const {Schema,model} = require('mongoose')
const designSchema = new Schema({
    customer:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    product:{
        type:Schema.Types.ObjectId,
        ref:'Product'
    },
    category:{
        type:Schema.Types.ObjectId,
        ref: 'Category',
    },
    size:{},
    color:{},
    charges:{
        type:Number,
        default:30
    },
    customization:[{
            image_url:{
                type:String,
                required:true
            },
            options:
                {
                    height:{
                        type:Number,
                    },
                    width:{
                        type:Number
                    },
                    xCord:{
                        type:Number
                    },
                    yCord:{
                        type:Number
                    }
                },
            amount:Number
        }],
    designName: String,
    frontImage:{
        image_url:{
            type:String,
            required:true
        }
    },
    backImage:{
        image_url:{
            type:String,
            required:true
        }
    }

}, { timestamps : true })
const  Design = model("Design",designSchema)
module.exports=Design;