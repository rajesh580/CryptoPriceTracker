const cron = require("node-cron");
const axios = require("axios");
const Alert = require("../models/Alert");

// Run every minute
cron.schedule("* * * * *", async () => {
  console.log("Checking price alerts...");

  const alerts = await Alert.find({ isTriggered: false });

  for (let alert of alerts) {
    const { coinId, threshold, condition } = alert;

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: { ids: coinId, vs_currencies: "usd" }
      }
    );

    const price = response.data[coinId].usd;

    if (
      (condition === "above" && price >= threshold) ||
      (condition === "below" && price <= threshold)
    ) {
      alert.isTriggered = true;
      await alert.save();

      console.log(`ALERT TRIGGERED: ${coinId} at ${price}`);
    }
  }const cron = require("node-cron");
const axios = require("axios");
const Alert = require("../models/Alert");

// Runs every 1 minute
cron.schedule("* * * * *", async () => {
  console.log("Checking alerts...");

  try {
    const alerts = await Alert.find({ isTriggered: false });

    for (let alert of alerts) {
      const { coinId, threshold, condition } = alert;

      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
          params: {
            ids: coinId,
            vs_currencies: "usd"
          }
        }
      );

      const currentPrice = response.data[coinId].usd;

      let triggered = false;

      if (condition === "above" && currentPrice >= threshold) {
        triggered = true;
      }

      if (condition === "below" && currentPrice <= threshold) {
        triggered = true;
      }

      if (triggered) {
        alert.isTriggered = true;
        await alert.save();
        console.log(`ALERT TRIGGERED: ${coinId} at $${currentPrice}`);
      }
    }
  } catch (error) {
    console.error("Alert check failed:", error.message);
  }
});

});
