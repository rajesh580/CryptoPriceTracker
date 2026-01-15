const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const priceRoutes = require("./routes/priceRoutes");
const alertRoutes = require("./routes/alertRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const userRoutes = require("./routes/userRoutes");
const startPriceStream = require("./services/priceStreamer");

const app = express();

// IMPORTANT: create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.IO to HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    
    // Cleanup corrupted alerts on startup
    const Alert = require("./models/Alert");
    Alert.deleteMany({ userId: { $exists: false } })
      .then((result) => {
        if (result.deletedCount > 0) {
          console.log(`⚠️ Cleaned up ${result.deletedCount} corrupted alerts`);
        }
      })
      .catch((err) => console.error("Error cleaning alerts:", err));
  })
  .catch((err) => console.error("Mongo error:", err));

// Routes
app.use("/api/prices", priceRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/users", userRoutes);

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start streaming prices
startPriceStream(io);

// START SERVER (IMPORTANT)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
