const express = require("express");
const axios = require("axios");
const Price = require("../models/Price");

const router = express.Router();

// Test endpoint to verify price fetching
router.get("/test", async (req, res) => {
  try {
    const currency = req.query.currency || "eur";
    console.log(`Testing price fetch for currency: ${currency}`);
    
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum",
          vs_currencies: currency
        },
        timeout: 10000
      }
    );
    console.log(`Test response:`, response.data);
    res.json({ status: "success", data: response.data });
  } catch (error) {
    console.error(`Test error:`, error.message);
    res.status(500).json({ status: "error", message: error.message, details: error.response?.data });
  }
});

// GET /api/prices?coins=bitcoin,ethereum&currency=usd
router.get("/", async (req, res) => {
  try {
    const { coins, currency = "usd" } = req.query;
    if (!coins) {
      return res.status(400).json({ error: "Coins parameter is required" });
    }

    const coinList = coins.split(",").map(c => c.trim());
    let results = {};

    // Map currency codes to CoinGecko format
    const currencyMap = {
      usd: "usd",
      eur: "eur",
      gbp: "gbp",
      jpy: "jpy",
      inr: "inr",
      aud: "aud"
    };

    const geckoVsCurrency = currencyMap[currency.toLowerCase()] || "usd";
    console.log(`Fetching prices for coins: ${coinList.join(",")} in currency: ${geckoVsCurrency}`);

    // First check if we have recent cached prices for this currency
    const recentCacheThreshold = 60000; // 1 minute
    let needsFresh = false;
    
    for (let coin of coinList) {
      const cached = await Price.findOne({ 
        coinId: coin, 
        currency: geckoVsCurrency 
      }).sort({ fetchedAt: -1 });

      if (!cached || (Date.now() - cached.fetchedAt.getTime()) > recentCacheThreshold) {
        needsFresh = true;
        break;
      }
    }

    // If we need fresh data, fetch from CoinGecko
    if (needsFresh) {
      try {
        console.log(`Fetching fresh data from CoinGecko for currency: ${geckoVsCurrency}`);
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price",
          {
            params: {
              ids: coinList.join(","),
              vs_currencies: geckoVsCurrency
            },
            timeout: 10000
          }
        );

        console.log("CoinGecko API Response received");

        for (let coin of coinList) {
          const priceData = response.data[coin];
          const price = priceData && priceData[geckoVsCurrency];

          if (price !== undefined && price !== null && price > 0) {
            // Save new price in MongoDB
            const priceRecord = await Price.create({
              coinId: coin,
              price: price,
              currency: geckoVsCurrency
            });

            results[coin] = price;
            console.log(`${coin} (${geckoVsCurrency}): ${price}`);
          } else {
            console.warn(`No valid price for ${coin} in ${geckoVsCurrency}`);
            // Fallback to most recent cached price of any currency
            const cached = await Price.findOne({ coinId: coin }).sort({ fetchedAt: -1 });
            results[coin] = cached ? cached.price : 0;
          }
        }
      } catch (apiError) {
        console.error(`CoinGecko API error:`, apiError.message);
        
        // Fallback: use most recent cached prices
        for (let coin of coinList) {
          const cached = await Price.findOne({ coinId: coin }).sort({ fetchedAt: -1 });
          results[coin] = cached ? cached.price : 0;
        }
      }
    } else {
      // Use cached prices
      console.log(`Using cached prices for currency: ${geckoVsCurrency}`);
      for (let coin of coinList) {
        const cached = await Price.findOne({ 
          coinId: coin, 
          currency: geckoVsCurrency 
        }).sort({ fetchedAt: -1 });
        results[coin] = cached ? cached.price : 0;
      }
    }

    console.log(`Final results:`, results);
    res.json(results);
  } catch (error) {
    console.error("Price fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch prices", details: error.message });
  }
});

// Get historical prices for a coin
router.get("/history/:coinId", async (req, res) => {
  const { coinId } = req.params;

  const history = await Price.find({ coinId, currency: "usd" })
    .sort({ fetchedAt: -1 })
    .limit(100);

  // Return in reverse order (oldest first)
  res.json(history.reverse());
});


module.exports = router;
