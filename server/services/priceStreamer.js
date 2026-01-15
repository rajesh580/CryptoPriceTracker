const axios = require("axios");
const Price = require("../models/Price");
const Alert = require("../models/Alert");

const coins = ["bitcoin", "ethereum", "solana", "dogecoin", "cardano"];

const startPriceStream = (io) => {
  setInterval(async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
          params: {
            ids: coins.join(","),
            vs_currencies: "usd"
          }
        }
      );

      const prices = response.data;
      const timestamp = new Date();

      // Save prices in MongoDB (historical)
      for (let coin of coins) {
        await Price.create({
          coinId: coin,
          price: prices[coin].usd,
          fetchedAt: timestamp
        });
      }

      // Send prices to frontend via WebSocket
      io.emit("priceUpdate", { prices, timestamp });

      // Check alerts - only those with proper userId
      const alerts = await Alert.find({ isTriggered: false, userId: { $exists: true } });
      console.log(`Found ${alerts.length} active alerts to check`);

      for (let alert of alerts) {
        try {
          const currentPrice = prices[alert.coinId]?.usd;
          if (!currentPrice) {
            console.log(`No price found for ${alert.coinId}`);
            continue;
          }

          const threshold = parseFloat(alert.threshold);
          console.log(`Checking alert: ${alert.coinId} ${alert.condition} ${threshold}, current: ${currentPrice}`);

          let triggered = false;
          if (alert.condition === "above" && currentPrice >= threshold) {
            triggered = true;
            console.log(`✓ Alert triggered: ${alert.coinId} is ${currentPrice} >= ${threshold}`);
          }
          if (alert.condition === "below" && currentPrice <= threshold) {
            triggered = true;
            console.log(`✓ Alert triggered: ${alert.coinId} is ${currentPrice} <= ${threshold}`);
          }

          if (triggered) {
            // Use updateOne instead of save to avoid validation issues
            await Alert.updateOne(
              { _id: alert._id },
              { isTriggered: true }
            );

            io.emit("alertTriggered", {
              coin: alert.coinId,
              price: currentPrice,
              condition: alert.condition,
              threshold: threshold
            });
          }
        } catch (alertError) {
          console.error(`Error processing alert ${alert._id}:`, alertError.message);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error("⚠️ CoinGecko rate limit reached. Waiting for next cycle...");
      } else if (error.message && error.message.includes("Alert validation failed")) {
        console.error("⚠️ Alert validation error - check database for corrupted alerts");
      } else if (error.message) {
        console.error("Price stream error:", error.message);
      } else {
        console.error("Price stream error:", error);
      }
    }
  }, 30000); // 30 seconds
};

module.exports = startPriceStream;
