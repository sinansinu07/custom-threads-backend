const {Schema,model} = require('mongoose')
const productSchema = new Schema({
    name:String,
    description:String,
    price:Number,
    sizes:[
        {
            size:String
        }
    ],
    colors:[
        {
            color:String
        }
    ],
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
    },
    category: {
        type : Schema.Types.ObjectId, 
        ref : 'Category'
    }
},{timestamps:true})
const  Product = model("Product",productSchema)
module.exports=Product;