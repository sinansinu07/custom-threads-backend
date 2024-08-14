const jwt = require( 'jsonwebtoken' )
const authenticateUser =(req,res,next)=>{
    const token = req.headers['authorization']
    if(!token){
        return res.status(401).json({error:'token is required'})
    }
    try{
        const tokenData = jwt.verify(token,process.env.JWT_SECRET)
        // console.log(tokenData)
        req.user ={
            id : tokenData.id,
            role : tokenData.role
        }
        next()
    }catch(err){
        res.status(401).json({error:'invalid token'})
    }
}
const authorizeUser = (permittedRole)=>{
    return (req,res,next)=>{
        if(permittedRole.includes(req.user.role)){
            next()
        }
        else{
            res.status(401).json({error:`You are not authorized to perform this action`})
        }
    }
}
module.exports = {authenticateUser,authorizeUser}