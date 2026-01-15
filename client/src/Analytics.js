import React, { useState, useEffect } from "react";
import * as html2canvas from "html2canvas";
import "./Analytics.css";

function Analytics({ priceHistory }) {
  const coins = ["bitcoin", "ethereum", "solana", "dogecoin", "cardano"];
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    calculateMetrics();
  }, [selectedCoin, priceHistory]);

  const calculateMetrics = () => {
    const data = priceHistory[selectedCoin] || [];
    if (data.length < 2) {
      // Set default metrics when data is not available
      setMetrics({
        current: 0,
        change: 0,
        highest: 0,
        lowest: 0,
        average: 0,
        sma20: 0,
        momentum: 0,
        volatility: "0.00",
        rsi: "50.00",
        macd: "0.000000",
        trend: "Loading..."
      });
      return;
    }

    const prices = data.map((d) => d.price);
    const n = prices.length;

    // Basic metrics
    const current = prices[n - 1];
    const previous = prices[0];
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const average = prices.reduce((a, b) => a + b) / n;
    const change = ((current - previous) / previous) * 100;

    // Simple Moving Average (20 period)
    const sma20 =
      prices.slice(-20).reduce((a, b) => a + b) / Math.min(20, prices.length);

    // Momentum (10 period)
    const momentum =
      prices.length >= 10 ? current - prices[prices.length - 10] : 0;

    // Volatility (standard deviation)
    const variance =
      prices.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / n;
    const volatility = Math.sqrt(variance);

    // RSI (Relative Strength Index) simplified
    let gains = 0,
      losses = 0;
    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / prices.length;
    const avgLoss = losses / prices.length;
    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    // MACD simplified (12-26 period)
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = calculateEMA([macd], 9);

    // Trend prediction
    const recentPrices = prices.slice(-5);
    const trendUp = recentPrices[4] > recentPrices[0];
    const trend = trendUp ? "Bullish 📈" : "Bearish 📉";

    setMetrics({
      current,
      change,
      highest,
      lowest,
      average,
      sma20,
      momentum,
      volatility: volatility.toFixed(2),
      rsi: isNaN(rsi) ? 50 : rsi.toFixed(2),
      macd: macd.toFixed(6),
      trend
    });
  };

  const calculateEMA = (prices, period) => {
    if (prices.length === 0) return 0;
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  };

  const exportAsCSV = () => {
    const data = priceHistory[selectedCoin] || [];
    let csv = "Time,Price\n";
    data.forEach((d) => {
      csv += `${d.time},${d.price}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedCoin}-prices.csv`;
    link.click();
  };

  return (
    <div className="analytics">
      <h2>📊 Advanced Analytics</h2>
      <p className="subtitle">Technical analysis and price predictions</p>

      <div className="analytics-header">
        <div className="coin-selector">
          <label>Select Coin</label>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="select-input"
          >
            {coins.map((coin) => (
              <option key={coin} value={coin}>
                {coin.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <button onClick={exportAsCSV} className="export-btn">
          📥 Export CSV
        </button>
      </div>

      {metrics ? (
        <div className="analytics-grid">
          <div className="analytics-section">
            <h3>Price Metrics</h3>
            <div className="metric-grid">
              <div className="metric-box">
                <label>Current Price</label>
                <value>${metrics.current.toFixed(2)}</value>
              </div>
              <div className="metric-box">
                <label>24h Change</label>
                <value className={metrics.change >= 0 ? "positive" : "negative"}>
                  {metrics.change >= 0 ? "📈" : "📉"} {metrics.change.toFixed(2)}%
                </value>
              </div>
              <div className="metric-box">
                <label>Highest</label>
                <value>${metrics.highest.toFixed(2)}</value>
              </div>
              <div className="metric-box">
                <label>Lowest</label>
                <value>${metrics.lowest.toFixed(2)}</value>
              </div>
              <div className="metric-box">
                <label>Average</label>
                <value>${metrics.average.toFixed(2)}</value>
              </div>
              <div className="metric-box">
                <label>Volatility</label>
                <value>${metrics.volatility}</value>
              </div>
            </div>
          </div>

          <div className="analytics-section">
            <h3>Technical Indicators</h3>
            <div className="metric-grid">
              <div className="metric-box">
                <label>RSI (14)</label>
                <value className={metrics.rsi > 70 ? "overbought" : metrics.rsi < 30 ? "oversold" : "neutral"}>
                  {metrics.rsi}
                  <small>
                    {metrics.rsi > 70
                      ? " - Overbought"
                      : metrics.rsi < 30
                      ? " - Oversold"
                      : " - Neutral"}
                  </small>
                </value>
              </div>
              <div className="metric-box">
                <label>MACD</label>
                <value>{metrics.macd}</value>
              </div>
              <div className="metric-box">
                <label>SMA (20)</label>
                <value>${metrics.sma20.toFixed(2)}</value>
              </div>
              <div className="metric-box">
                <label>Momentum</label>
                <value className={metrics.momentum >= 0 ? "positive" : "negative"}>
                  {metrics.momentum >= 0 ? "📈" : "📉"} ${Math.abs(metrics.momentum).toFixed(2)}
                </value>
              </div>
            </div>
          </div>

          <div className="analytics-section prediction">
            <h3>Trend Prediction</h3>
            <div className="trend-box">
              <div className="trend-indicator">{metrics.trend}</div>
              <p className="trend-description">
                {metrics.trend.includes("Bullish")
                  ? "🚀 Price shows upward momentum in recent trading sessions."
                  : "⚠️ Price shows downward momentum in recent trading sessions."}
              </p>
              <div className="disclaimer">
                <strong>Disclaimer:</strong> These predictions are based on historical data
                and technical analysis only. Past performance does not guarantee future results.
                Always do your own research.
              </div>
            </div>
          </div>

          <div className="analytics-section">
            <h3>Indicator Guide</h3>
            <div className="guide">
              <div className="guide-item">
                <strong>RSI:</strong> Values above 70 = Overbought, below 30 = Oversold
              </div>
              <div className="guide-item">
                <strong>MACD:</strong> Momentum indicator showing trend direction
              </div>
              <div className="guide-item">
                <strong>SMA (20):</strong> 20-period Simple Moving Average for trend identification
              </div>
              <div className="guide-item">
                <strong>Volatility:</strong> Standard deviation measuring price fluctuations
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-state">Loading analytics data...</div>
      )}
    </div>
  );
}

export default Analytics;
