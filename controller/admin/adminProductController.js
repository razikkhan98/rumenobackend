const asyncHandler = require("express-async-handler");
const adminProductModel = require("../../model/admin/adminProductModel");

exports.createProduct = asyncHandler(async (req, res) => {
    try {
        const {
            uid,
            name,
            priceText,
            img,
            metadescription,
            veg,
            offer,
            delivery,
            refundable,
            weight,
            shortDiscription,
            description,
            instruction,
            category,
            type,
            imgText,
            script,
            video,
            stock
        } = req.body;

        if (
            !uid ||
            !name ||
            !priceText ||
            !offer ||
            !description ||
            !metadescription ||
            !script ||
            !stock
        ) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }

        const blog = await adminProductModel.create(req?.body);
        if (!blog) {
            return res.status(400).json({ message: "Blog not created" });
        }
        res.status(200).json({
            success: true,
            message: "Product created successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// Get All Product
exports.getAllProduct = asyncHandler(async (req, res, next) => {
    try {
        const user = await adminProductModel.find();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

// Get Product By Id
exports.getProductById = asyncHandler(async (req, res, next) => {
    try {
        const product = await adminProductModel.findById(req?.params?.id);
        if (!product) res.status(404).json("product not found!");

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// Update cart item
exports.updateProduct = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { uid,name,priceText,img,metadescription,veg,offer,delivery,refundable,weight,shortDiscription,description,
        instruction,category,type,imgText,script,video,stock } = req.body;
    // Validate required fields
    if (!uid || !name  )
      return res.status(400).json({ message: "Please fill in all fields" });
  
    // Check if item exists in cart
    const existingProduct = await adminProductModel.findOne({ uid });
    if (!existingProduct) {
      return res.status(400).json({ message: "Product does not exist" });
    }
    console.log(existingProduct);

    // Update item in cart
    await adminProductModel.updateMany({ uid,name,priceText,img,metadescription,veg,offer,delivery,refundable,
        weight,shortDiscription,description,instruction,category,type,imgText,script,video,stock });

    res.status(200).json({ message: "Product updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



//Delete Product
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    try {
        const product = await adminProductModel.findByIdAndDelete(req?.params?.id);
        if (!product) res.status(404).json("Product not found!");

        res.status(200).json({
            success: true,
            message: "Product delete successfully"
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}); 