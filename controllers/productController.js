const Product = require('../models/Product');
const multer = require('multer');
const Firm = require('../models/Firm');
const path = require('path');

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, 'uploads/')
    },
    filename:function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({storage:storage})

const addProduct =async (req, res) => {
    try {
        const {productName, price, category, bestSeller, description}=req.body;
        const image = req.file? req.file.filename : undefined ;

        const firmId=req.params.firmId;
        const firm =await Firm.findById(firmId);

        if(!firm){
            return res.status(404).json({message:"Firm not found"});
        }
 
        const product= new Product({productName, price, category, bestSeller, description,image, firm: firm._id});
        const savedproduct = await product.save();
        firm.products.push(savedproduct);
        await firm.save();
        res.status(200).json({savedproduct})

    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"internal server error"})
    }
}

const getProductByFirm =async (req, res) => {
    try {
        const firmId=req.params.firmId;
        const firm =await Firm.findById(firmId);

        if(!firm){
            return res.status(404).json({message:"Firm not found"});
        }

        const resturantName =firm.firmName
        const products=await Product.find({firm: firmId});
        res.status(200).json({resturantName, products})

    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"internal server error"})
    }
}

const deleteProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if(!deletedProduct){
            return res.status(404).json({message:"no product found"})
        }
        console.log("product deleted") 
        res.status(200).json({deletedProduct})
    } catch (error) {
        return res.status(500).json({error:"internal server error"})
    }
}

module.exports = {addProduct :[upload.single('image'), addProduct ], getProductByFirm, deleteProductById}