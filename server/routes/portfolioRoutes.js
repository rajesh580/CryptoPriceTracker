const express = require("express");
const Portfolio = require("../models/Portfolio");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all portfolio items for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ userId: req.userId }).sort({ addedAt: -1 });
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

// Add coin to portfolio
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { coin, quantity, purchasePrice } = req.body;
    
    if (!coin || quantity <= 0) {
      return res.status(400).json({ error: "Invalid coin or quantity" });
    }

    // Check if coin already exists for this user
    const existing = await Portfolio.findOne({ userId: req.userId, coin });
    
    if (existing) {
      existing.quantity += quantity;
      if (purchasePrice) existing.purchasePrice = purchasePrice;
      await existing.save();
      return res.json(existing);
    }

    const portfolioItem = await Portfolio.create({ 
      userId: req.userId,
      coin, 
      quantity,
      purchasePrice: purchasePrice || 0
    });
    res.status(201).json(portfolioItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to add coin to portfolio" });
  }
});

// Update portfolio item
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { quantity, purchasePrice } = req.body;

    if (quantity && quantity <= 0) {
      await Portfolio.findOneAndDelete({ _id: req.params.id, userId: req.userId });
      return res.json({ message: "Portfolio item deleted" });
    }

    const updated = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { quantity, purchasePrice },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update portfolio" });
  }
});

// Delete portfolio item
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Portfolio.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    if (!deleted) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }

    res.json({ message: "Portfolio item deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete portfolio item" });
  }
});

module.exports = router;
