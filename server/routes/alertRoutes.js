const express = require("express");
const Alert = require("../models/Alert");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create alert
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { coinId, threshold, condition } = req.body;

    if (!coinId || !threshold || !condition) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const alert = await Alert.create({
      userId: req.userId,
      coinId,
      threshold,
      condition
    });
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: "Failed to create alert" });
  }
});

// Get user alerts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.userId });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// Delete alert
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    if (!deleted) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({ message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete alert" });
  }
});

// Cleanup corrupted alerts (admin only)
router.delete("/admin/cleanup", async (req, res) => {
  try {
    // Remove alerts without userId
    const result = await Alert.deleteMany({ userId: { $exists: false } });
    res.json({ 
      message: `Cleaned up ${result.deletedCount} corrupted alerts`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to cleanup alerts" });
  }
});

module.exports = router;
