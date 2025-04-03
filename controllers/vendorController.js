const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotEnv=require("dotenv");

dotEnv.config();

const secretKey=process.env.whatIsYourName;

const vendorRegister = async(req, res) => {
    const {username, email, password} = req.body;

    try{
        const vendorEmail = await Vendor.findOne({email})
        if (vendorEmail){
            return res.status(400).json("Email Already Taken")
        }

        const hashedPassword= await bcrypt.hash(password, 10)

        const newVendor = new Vendor({
            username,
            email,
            password:hashedPassword
    
        });

        await newVendor.save();
        res.status(201).json({message : "Vendor Registered Successfully"})
        console.log("registered");
    }
    catch(error){
        console.error(error)
        res.status(500).json({error: "Internal Server Error"})
    }  
}

const vendorLogin = async(req, res) => {
    const {email, password} = req.body;

    try{
        const vendor = await Vendor.findOne({email});
        console.log(vendor)

        if (!vendor || !(await bcrypt.compare(password, vendor.password))){
            return res.status(401).json({ error:" Invalid username or password " })
        }

        const token = jwt.sign( {vendorId:vendor._id}, secretKey, {expiresIn : "1h"});
        const vendorId = vendor._id;

        res.status(200).json({ success : "Login Successful", token, vendorId})
    }
    catch(error){
        console.error(error)
        res.status(500).json({error:"Internal server error"})
    }   
}

const getAllVendors=async(req, res) => {
    try {
        const vendors = await Vendor.find().populate('firm');
        res.json({vendors});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal server error"})
    }
}

const getvendorById=async(req, res) => {
    const vendorId = req.params.id;

    try {
        const vendor = await Vendor.findById(vendorId).populate('firm');
        console.log(vendor);

        if(!vendor){
            return res.status(404).json({message:"vendor not found"})
        }

        const vendorFirmId = vendor.firm[0]._id;
        const vendorFirmName=vendor.firm[0].firmName

        res.status(200).json({vendorFirmId, vendorFirmName});
        console.log(vendorFirmId);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Internal server error"})
    }
}

module.exports = {vendorRegister, vendorLogin, getAllVendors, getvendorById};