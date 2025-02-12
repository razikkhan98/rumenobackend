const expressAsyncHandler = require("express-async-handler");
const transactionModel = require("../../model/user/transactionModel");
// const deleteCartItem = require("../../controller/user/addToCartController");

// Transaction a new user
exports.userTransaction = expressAsyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const {
      uid,
      name,
      email,
      mobile,
      address,
      amount,
      transactionID,
      paymode,
      cod_payment,
      image,
      cart,
    } = req.body;

    // Validation
    if (
      !uid ||
      !name ||
      !email ||
      !mobile ||
      !address ||
      !amount ||
      !transactionID ||
      !paymode ||
      !cod_payment ||
      !image ||
      !cart
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // // Step 1: Check stock availability
    // const Stockcheck = await checkStock(cart);
    // if (Stockcheck.status !== 207) {
    //     return res.status(404).send(Stockcheck);
    // }

    // // Step 2: Update stock quantity
    // const updateQuantity = await updateProductStock(cart);
    // if (updateQuantity.status !== 207) {
    //     return res.status(404).send(updateQuantity);
    // }

    // Create new transaction
    const newTransaction = new transactionModel({
      uid,
      name,
      email,
      mobile,
      address,
      amount,
      transactionID,
      paymode,
      cod_payment,
      image,
      cart,
    });
    console.log(newTransaction);

    await newTransaction.save();
    res.status(201).json({ message: "Transaction successfully" });

    // // Remove items from cart after transaction
    // await deleteAfterTransaction(req?.body.uid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get transaction Api
exports.getTransaction = expressAsyncHandler(async (req, res) => {
  try {
    const user = await transactionModel.find();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
