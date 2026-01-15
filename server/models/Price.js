const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  coinId: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "usd" },
  fetchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Price", priceSchema);
