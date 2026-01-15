import React, { useState, useEffect } from "react";
import "./Comparison.css";

function Comparison() {
  const [selectedCoins, setSelectedCoins] = useState(["bitcoin", "ethereum"]);
  const [prices, setPrices] = useState({});
  const [priceHistory, setPriceHistory] = useState({});
  const [loading, setLoading] = useState(true);

  const allCoins = ["bitcoin", "ethereum", "solana", "dogecoin", "cardano"];

  useEffect(() => {
    fetchData();
  }, [selectedCoins]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const coinList = selectedCoins.join(",");
      
      // Fetch current prices
      const priceResponse = await fetch(
        `http://localhost:5000/api/prices?coins=${coinList}`
      );
      const priceData = await priceResponse.json();
      setPrices(priceData);

      // Fetch history for comparison
      const historyPromises = selectedCoins.map((coin) =>
        fetch(`http://localhost:5000/api/prices/history/${coin}`)
          .then((res) => res.json())
      );
      const histories = await Promise.all(historyPromises);
      
      const historyMap = {};
      selectedCoins.forEach((coin, index) => {
        historyMap[coin] = histories[index];
      });
      setPriceHistory(historyMap);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch comparison data:", error);
      setLoading(false);
    }
  };

  const toggleCoin = (coin) => {
    if (selectedCoins.includes(coin)) {
      if (selectedCoins.length > 1) {
        setSelectedCoins(selectedCoins.filter((c) => c !== coin));
      }
    } else {
      setSelectedCoins([...selectedCoins, coin]);
    }
  };

  const calculateMetrics = (coin) => {
    if (!priceHistory || !priceHistory[coin]) return null;
    
    const history = priceHistory[coin];
    if (!history || history.length < 2) return null;

    const prices_arr = history.map((h) => h.price || 0).filter(p => p > 0);
    if (prices_arr.length < 2) return null;

    const current = prices_arr[prices_arr.length - 1];
    const previous = prices_arr[0];
    const highest = Math.max(...prices_arr);
    const lowest = Math.min(...prices_arr);
    const average = prices_arr.reduce((a, b) => a + b) / prices_arr.length;
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return { current, highest, lowest, average, change };
  };

  return (
    <div className="comparison">
      <h2>🔄 Coin Comparison Tool</h2>
      <p className="subtitle">Compare multiple cryptocurrencies side by side</p>

      <div className="coin-selector">
        <h3>Select Coins to Compare</h3>
        <div className="coin-buttons">
          {allCoins.map((coin) => (
            <button
              key={coin}
              className={`coin-btn ${selectedCoins.includes(coin) ? "active" : ""}`}
              onClick={() => toggleCoin(coin)}
            >
              {coin.toUpperCase()}
              {selectedCoins.includes(coin) && " ✓"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading comparison data...</div>
      ) : (
        <div className="comparison-grid">
          {selectedCoins.map((coin) => {
            const metrics = calculateMetrics(coin);
            const currentPrice = prices[coin] || 0;

            return (
              <div key={coin} className="comparison-card">
                <div className="card-header">
                  <h4>{coin.toUpperCase()}</h4>
                  <span className="current-price">${currentPrice.toFixed(2)}</span>
                </div>

                {metrics && (
                  <div className="metrics">
                    <div className="metric">
                      <span className="label">24h Change</span>
                      <span className={`value ${metrics.change >= 0 ? "positive" : "negative"}`}>
                        {metrics.change >= 0 ? "📈" : "📉"} {metrics.change.toFixed(2)}%
                      </span>
                    </div>

                    <div className="metric">
                      <span className="label">Highest</span>
                      <span className="value">${metrics.highest.toFixed(2)}</span>
                    </div>

                    <div className="metric">
                      <span className="label">Lowest</span>
                      <span className="value">${metrics.lowest.toFixed(2)}</span>
                    </div>

                    <div className="metric">
                      <span className="label">Average</span>
                      <span className="value">${metrics.average.toFixed(2)}</span>
                    </div>

                    <div className="metric">
                      <span className="label">Range</span>
                      <span className="value">
                        ${(metrics.highest - metrics.lowest).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="comparison-stats">
        <h3>Performance Summary</h3>
        <div className="stats-grid">
          {selectedCoins.length > 0 && (
            <>
              <div className="stat-card">
                <strong>Best Performer</strong>
                <p>
                  {selectedCoins.reduce((best, coin) => {
                    const bestMetrics = calculateMetrics(best);
                    const coinMetrics = calculateMetrics(coin);
                    return (coinMetrics?.change || 0) > (bestMetrics?.change || 0)
                      ? coin
                      : best;
                  })}
                </p>
              </div>
              <div className="stat-card">
                <strong>Highest Price</strong>
                <p>
                  {selectedCoins.reduce((highest, coin) => {
                    const metrics = calculateMetrics(coin);
                    return metrics && metrics.highest > (calculateMetrics(highest)?.highest || 0)
                      ? coin
                      : highest;
                  })}
                </p>
              </div>
              <div className="stat-card">
                <strong>Most Volatile</strong>
                <p>
                  {selectedCoins.reduce((volatile, coin) => {
                    const metrics = calculateMetrics(coin);
                    const volatility = metrics
                      ? Math.abs((metrics.highest - metrics.lowest) / metrics.average)
                      : 0;
                    const volMetrics = calculateMetrics(volatile);
                    const volVolatility = volMetrics
                      ? Math.abs((volMetrics.highest - volMetrics.lowest) / volMetrics.average)
                      : 0;
                    return volatility > volVolatility ? coin : volatile;
                  })}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comparison;
