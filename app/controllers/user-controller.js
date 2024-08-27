const _ = require("lodash")
const jwt = require('jsonwebtoken')
const transporter = require('../../config/nodemailer')
const User = require('../models/user-model')
const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const twilio = require('twilio')
const userCtrl={}
const render = process.env.RENDER
const localhost = process.env.LOCALHOST

userCtrl.register = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()})
    }
    const body =req.body
    const user = new User(body)

    try{
        const salt = await bcrypt.genSalt()
        const encryptedPassword = await bcrypt.hash(user.password,salt)
        const regUser = await User.find()
        if(regUser.length===0){
            user.role='admin'
        }else{
            user.role='customer'
        }
        user.password=encryptedPassword
        await user.save()
        res.status(200).json(user)
      
    }catch(err){
        res.status(500).json({error:'internal server error'})
    }
}
userCtrl.sendOtp= async(req,res)=>{
    const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000);
    };
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioClient = twilio(accountSid, authToken);
    const twilioPhoneNumber = '+12515720668';
    const user = await User.findById(req.user.id)
    const phoneNumber = user.phone.countryCode + user.phone.number
    console.log('phone:',phoneNumber)

    const otp= generateOTP()
    await User.findByIdAndUpdate(req.user.id,{'phone.otp':otp},{new:true})
    try {
        await twilioClient.messages.create({
          body: `Your OTP for registration is: ${otp}`,
          from: twilioPhoneNumber,
          to: phoneNumber
        });
        res.status(200).json({ message: 'OTP sent successfully' });
      } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
      }
}
userCtrl.verifyOtp=async(req,res)=>{
    const {sentOtp}= req.body
    const user=await User.findById(req.user.id)
    const storedOtp = user.phone.otp
    if(storedOtp!=sentOtp){
        return res.status(400).json({message:"Invalid OTP"});
    }else{
        await User.findByIdAndUpdate(req.user.id,{'phone.isVerified' : true,'phone.otp':null},{new:true})
        return  res.status(200).json({message:"OTP verified Successfully"});
    }
}
userCtrl.verifyLink = async(req,res)=>{
    const verifyToken = Math.random().toString(36).slice(2);
    const user = await User.findById(req.user.id)
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Verify Your Email',
        text: `Click the following link to verify your email: ${render}/verify/${verifyToken}`
    }
    user.verificationToken=verifyToken;
    transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error)
                return res.status(500).send('Error sending verification email')
            } else {
                user.save()
                console.log('Email sent: ' + info.response)
                //return res.status(200).send('Verification email sent');
                res.status(201).json([{data:_.omit(user.toJSON(),['password']),message:'email verification sent'}])
            }
        })
}
userCtrl.verifyEmail = async(req,res)=>{
    const token = req.params.token
    try{
        const user=await (User.findOneAndUpdate({verificationToken:token},{isVerified:true,verificationToken:null},{new:true}).select({password:0}))
        if(!user){
            return res.status(404).json('Email already verified')
        }
        res.redirect(`${render}/customer-profile`)
    }catch(err){
        res.status(500).json({error:'internal server error'})
    }
}

userCtrl.login  =async (req,res)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const body = req.body
        let user = await User.findOne({$or:[{'phone.number':body.username}, {email:body.username}]})
        
        if(!user){
            return res.status(404).json({error:"invalid login credentials"})
        }
        const checkPassword = await bcrypt.compare(body.password,user.password)
        if (!checkPassword){
            return res.status(404).json({error:'invalid login credentials'})
        }
        // if(!user.isVerified){
        //     return res.status(400).json({error:'user is not verified'})
        // }
        const tokenData={
            id : user._id, 
            role:user.role
        }
        const token = jwt.sign(tokenData,process.env.JWT_SECRET,{expiresIn:'7d'})
        user =await User.findOneAndUpdate({$or:[{'phone.number':body.username}, {email:body.username}]},{jwtToken:token},{new:true})
        // console.log(user)
        res.json({token:token , user:user })
    }catch(err){
        // console.log('Error in login', err);
        res.status(500).json({error:'internal server error'})
    } 
}

userCtrl.changePassword = async(req,res)=>{
    const{currentPassword,newPassword} = req.body
    try{
        const salt =  await bcrypt.genSalt()
        const user = await User.findById(req.user.id)
        const checkPassword = await bcrypt.compare(currentPassword,user.password)
        if(!checkPassword){
            return res.status(401).json( {message:"current password is incorrect"} )
        }
        const hashedPassword = await bcrypt.hash(newPassword,salt)
        user.password=hashedPassword
        await user.save()
        res.status(201).json({message:"password changed successfully"})
    }catch(err){
        res.status(500).json('internal server error')
    }
}

userCtrl.fPSendOtp= async(req,res)=>{
    const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000);
    };
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioClient = twilio(accountSid, authToken);
    const twilioPhoneNumber = '+12515720668';
    const user = await User.findOne({'phone.number':req.body.phone})
    if(!user){
        return res.status(404).json({ message : "User not found." });
    }
    const phoneNumber = user.phone.countryCode+user.phone.number
    console.log('phone:',phoneNumber)

    const otp= generateOTP()
    await User.findOneAndUpdate({'phone.number':req.body.phone},{'phone.otp':otp},{new:true})
    try {
        await twilioClient.messages.create({
          body: `Your OTP for password reset is: ${otp}`,
          from: twilioPhoneNumber,
          to: phoneNumber
        });
        res.status(200).json({ message: 'OTP sent successfully' });
      } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
      }
}
userCtrl.fPVerifyOtpAndChangePassword=async(req,res)=>{
    const {sentOtp,newPassword}= req.body
    const user=await User.findOne({'phone.otp':sentOtp})
    // const storedOtp = user.phone.otp
    if(!user){
        return res.status(400).json({message:"Invalid OTP"});
    }
    try{
        const salt =  await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(newPassword,salt)
        // user.password=hashedPassword
        await User.findOneAndUpdate({'phone.otp':sentOtp},{password:hashedPassword,'phone.otp':null},{new:true})
        res.status(201).json({message:"password changed successfully"})
    }catch(err){
        res.status(500).json('internal server error')
    }
}


userCtrl.account =async (req,res)=>{
    try{
        const user = await(User.findById(req.user.id).select({password:0}))
        // if(user.phone.isVerified){
            return res.status(200).json(user)
        // }else{
        //     return res.status(400).json({error:'user is not verified'})
        // }
        
    }catch(err){
        res.status(500).json({error:"internal server error"})
    }
}

userCtrl.changeUsername = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const { body } = req
        const user = await User.findOneAndUpdate({ _id: req.user.id }, { username: body.username }, { new: true })
        // console.log(user)
        res.status(200).json(user)
    } catch(err) {
        res.status(500).json({error:"internal server error"})
    }
}

userCtrl.changeEmail = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const { body } = req
        const user = await User.findOneAndUpdate({ _id: req.user.id }, { email: body.email,isVerified:false }, { new: true })
        // console.log(user)
        res.status(200).json(user)
    } catch(err) {
        res.status(500).json({error:"internal server error"})
    }
}

userCtrl.changePhoneSendOTP = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const { body } = req
        const generateOTP = () => {
            return Math.floor(100000 + Math.random() * 900000);
        };
        const accountSid = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioClient = twilio(accountSid, authToken);
        const twilioPhoneNumber = '+12515720668';
        const user = await User.findById(req.user.id)
        const phoneNumber = user.phone.countryCode + body.phone
        console.log('phone:',phoneNumber)
    
        const otp= generateOTP()
        await User.findByIdAndUpdate(req.user.id,{'phone.otp':otp,'phone.isVerified' : false},{new:true})
        try {
            await twilioClient.messages.create({
              body: `Your OTP for registration is: ${otp}`,
              from: twilioPhoneNumber,
              to: phoneNumber
            });
            res.status(200).json({ message: 'OTP sent successfully' });
          } catch (error) {
            console.error('Error sending OTP:', error);
            res.status(500).json({ message: 'Failed to send OTP' });
          }
        // console.log(user)
        // res.status(200).json(user)
    } catch(err) {
        res.status(500).json({error:"internal server error"})
    }
}

userCtrl.VerifyOtpAndChangePhone=async(req,res)=>{
    const {OTP,phone}= req.body
    console.log(phone)
    console.log(OTP)
    const user=await User.findOne({'phone.otp':OTP})
    // const storedOtp = user.phone.otp
    if(!user){
        return res.status(400).json({message:"Invalid OTP"});
    }
    try{
        // user.password=hashedPassword
        await User.findOneAndUpdate({'phone.otp':OTP}, {'phone.number':phone,'phone.isVerified' : true,'phone.otp':null}, {new:true})

        res.status(201).json({message:"phone Number changed successfully"})
    }catch(err){
        res.status(500).json('internal server error')
    }
}


module.exports = userCtrl