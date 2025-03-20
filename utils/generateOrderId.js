const Transaction = require("../model/user/transactionModel");

const generateOrderId = async () => {
  const lastOrder = await Transaction.findOne().sort({ createdAt: -1 }); // Get last order
  const lastOrderId = lastOrder ? parseInt(lastOrder.order.replace("ORD", "")) : 1000;
  return `ORD${lastOrderId + 1}`;
};

module.exports = generateOrderId;
