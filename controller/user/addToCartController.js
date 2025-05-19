// Add to cart
// Post /rumeno/addtocart

const expressAsyncHandler = require("express-async-handler");
const cartModel = require("../../model/user/addToCartModal");

// Add item to cart
exports.addToCart = expressAsyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { uid, name, img, price, totalAmount, stock, quantity, productId , weight} = req.body;
    console.log(req.body)

    // Validate required fields
    if (!uid || !name || !img || !totalAmount || !price || !stock || !quantity || !productId  || !weight) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if item already exists in cart
    const existingItem = await cartModel.findOne({ uid, name, productId });
    if (existingItem) {
      return res.status(400).json({ message: "Item already exists in cart" });
    }

    // Add item to cart
    const cartItem = new cartModel({
      uid,
      name,
      img,
      totalAmount: price * quantity ,
      price,
      quantity,
      stock,
      productId,
      weight
    });
    
    // Save user to the database
    await cartItem.save();
    res.status(201).json({ message: "Item added to cart" });
    
    // Decrement stock if item is added to cart
    if (stock >= quantity) {
       const updatedStock = stock - quantity;
      await cartModel.updateOne({ uid, name }, { stock: updatedStock });
    }
    else {
      return res.status(400).json({ message: "Out of stock" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cart items
exports.getCartItems = expressAsyncHandler(async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const cartItems = await cartModel.find({ uid });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update cart item
exports.updateCartItem = expressAsyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ message: "Id is required" })
  }
  
  try {
    const { uid, name, productId, quantity } = req.body;
    // Validate required fields
    if (!uid || !name  || !productId || !quantity) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    console.log(req.body)
    
    // Check if item exists in cart
    const existingItem = await cartModel.findOne({ uid, name, productId });
    if (!existingItem) {
      return res.status(400).json({ message: "Item does not exist in cart" });
    }
    console.log(existingItem);
    
    const amount =  existingItem?.totalAmount * quantity ;

    // Update item in cart
    await cartModel.findOneAndUpdate({ uid, name, productId }, { totalAmount:amount, quantity });
    res.status(200).json({ message: "Item updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Delete cart item
exports.deleteCartItem = expressAsyncHandler(async (req, res) => {
  // Validate request body

  if (!req.body || !req.body.id) {
    return res.status(400).json({ message: "Id is required" })
  }
  
    // Check if item exists in cart
    try {
      const DeleteItem = await cartModel.findByIdAndDelete( req.body.id);
    if (!DeleteItem) {
      return res.status(400).json({ message: "Item does not exist in cart" });
    }
    
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


















