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
    const { uid, name, img, amount, price } = req.body;
    console.log('uid, name, img, amount, price: ', uid, name, img, amount, price);
    console.log('req.body: ', req.body);

    // Validate required fields
    if (!uid || !name || !img || !amount || !price ) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if item already exists in cart
    const existingItem = await cartModel.findOne({ uid, name });
    if (existingItem) {
      return res.status(400).json({ message: "Item already exists in cart" });
    }

    // Add item to cart
    const cartItem = new cartModel({
      uid,
      name,
      img,
      amount,
      price,
    });

    // Save user to the database
    await cartItem.save();
    res.status(201).json({ message: "Item added to cart" });

   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cart items
exports.getCartItems = expressAsyncHandler(async (req, res) => {
  try {
    const cartItems = await cartModel.find();
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
  try {
    const { uid, name, amount } = req.body;
    // Validate required fields
    if (!uid || !name || !amount) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    
    // Check if item exists in cart
    const existingItem = await cartModel.findOne({ uid, name });
    if (!existingItem) {
      return res.status(400).json({ message: "Item does not exist in cart" });
    }
    console.log(existingItem);

    // Update item in cart
    await cartModel.updateOne({ uid, name }, { amount });
    res.status(200).json({ message: "Item updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Delete cart item
exports.deleteCartItem = expressAsyncHandler(async (req, res) => {
    // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { uid, name } = req.body;

    // Validate required fields
    if (!uid || !name) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if item exists in cart
    const existingItem = await cartModel.findOne({ uid, name });
    if (!existingItem) {
      return res.status(400).json({ message: "Item does not exist in cart" });
    }
    // Delete item from cart
    await cartModel.deleteOne({ uid, name });
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
