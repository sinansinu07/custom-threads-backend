const mongoose = require('mongoose')
const configureDB = async()=>{
    // const connectionParams = {
    //     useNewUrlParser:true,
    //     useUnifiedTopology: true,
    // }
    try{
        await mongoose.connect(process.env.MONGODB_REMOTE)
        console.log("MongoDB Connected...");
        console.log("hllp");
    }catch(err){
        console.error(err,"Error in Connecting to MongoDB")
    }
}
module.exports=configureDB;