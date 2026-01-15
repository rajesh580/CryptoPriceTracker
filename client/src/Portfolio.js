import React, { useState, useEffect } from "react";
import "./Portfolio.css";

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState({});
  const [newCoin, setNewCoin] = useState({ coin: "bitcoin", quantity: 0 });
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const currency = "usd"; // Fixed to USD

  const coins = ["bitcoin", "ethereum", "solana", "dogecoin", "cardano"];

  const currencySymbols = {
    usd: "$",
    eur: "€",
    gbp: "£",
    jpy: "¥",
    inr: "₹",
    aud: "A$"
  };

  // Fetch portfolio from backend
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:5000/api/portfolio", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPortfolio(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
        setPortfolio([]);
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Calculate total value when portfolio or prices change
  useEffect(() => {
    calculateTotalValue();
  }, [portfolio, prices, currency]);

  // Fetch current prices
  useEffect(() => {
    const fetchCurrentPrices = async () => {
      try {
        const coinList = coins.join(",");
        const response = await fetch(`http://localhost:5000/api/prices?coins=${coinList}&currency=${currency}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Ensure all coins have prices, default to 0 if missing
        const validPrices = {};
        coins.forEach(coin => {
          validPrices[coin] = data[coin] || 0;
        });
        
        setPrices(validPrices);
      } catch (error) {
        console.error("Failed to fetch prices:", error);
        // Set fallback prices
        const fallbackPrices = {};
        coins.forEach(coin => {
          fallbackPrices[coin] = 0;
        });
        setPrices(fallbackPrices);
      }
    };

    fetchCurrentPrices();
    const interval = setInterval(fetchCurrentPrices, 5000);
    return () => clearInterval(interval);
  }, [currency]);

  const calculateTotalValue = () => {
    let total = 0;
    portfolio.forEach((item) => {
      const price = prices[item.coin] || 0;
      total += item.quantity * price;
    });
    setTotalValue(total);
  };

  const addCoinToPortfolio = async () => {
    if (newCoin.quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          coin: newCoin.coin,
          quantity: parseFloat(newCoin.quantity)
        })
      });

      const added = await response.json();
      
      // Check if coin already exists in portfolio
      const existingIndex = portfolio.findIndex((item) => item.coin === newCoin.coin);
      if (existingIndex >= 0) {
        const updated = [...portfolio];
        updated[existingIndex] = added;
        setPortfolio(updated);
      } else {
        setPortfolio([...portfolio, added]);
      }

      setNewCoin({ coin: "bitcoin", quantity: 0 });
    } catch (error) {
      console.error("Failed to add coin:", error);
      alert("Failed to add coin to portfolio");
    }
  };

  const removeCoin = async (id, coin) => {
    try {
      const token = localStorage.getItem("authToken");
      await fetch(`http://localhost:5000/api/portfolio/${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      setPortfolio(portfolio.filter((item) => item.coin !== coin));
    } catch (error) {
      console.error("Failed to delete coin:", error);
      alert("Failed to remove coin from portfolio");
    }
  };

  const updateQuantity = async (id, coin, quantity) => {
    if (quantity <= 0) {
      removeCoin(id, coin);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/portfolio/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ quantity })
      });

      const updated = await response.json();
      setPortfolio(
        portfolio.map((item) => (item._id === id ? updated : item))
      );
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity");
    }
  };

  return (
    <div className="portfolio">
      <h2>💼 Portfolio</h2>
      <p className="subtitle">Track your cryptocurrency holdings and total value</p>

      <div className="portfolio-grid">
        <div className="add-coin-section">
          <h3>Add to Portfolio</h3>
          <div className="form-group">
            <select
              value={newCoin.coin}
              onChange={(e) => setNewCoin({ ...newCoin, coin: e.target.value })}
              className="form-select"
            >
              {coins.map((coin) => (
                <option key={coin} value={coin}>
                  {coin.toUpperCase()}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.00001"
              value={newCoin.quantity}
              onChange={(e) => setNewCoin({ ...newCoin, quantity: parseFloat(e.target.value) || 0 })}
              placeholder="Quantity"
              className="form-input"
            />
            <button onClick={addCoinToPortfolio} className="btn-add">
              Add Coin
            </button>
          </div>
        </div>

        <div className="portfolio-summary">
          <h3>Portfolio Value</h3>
          <div className="total-value">
            <span className="currency">{currencySymbols[currency]}</span>
            <span className="amount">{totalValue.toFixed(2)}</span>
          </div>
          <p className="holdings-count">{portfolio.length} Coins Held</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading portfolio...</div>
      ) : portfolio.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💰</span>
          <p>No coins in your portfolio</p>
          <small>Add coins above to start tracking your holdings</small>
        </div>
      ) : (
        <div className="holdings-list">
          {portfolio.map((item) => {
            const price = prices[item.coin] || 0;
            const itemValue = item.quantity * price;
            const percentage = totalValue > 0 ? (itemValue / totalValue) * 100 : 0;

            return (
              <div key={item._id} className="holding-card">
                <div className="holding-header">
                  <h4>{item.coin.toUpperCase()}</h4>
                  <span className="holding-value">{currencySymbols[currency]}{itemValue.toFixed(2)}</span>
                </div>
                <div className="holding-details">
                  <div className="detail-row">
                    <span>Quantity:</span>
                    <input
                      type="number"
                      step="0.00001"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item._id, item.coin, parseFloat(e.target.value))}
                      className="quantity-input"
                    />
                  </div>
                  <div className="detail-row">
                    <span>Price:</span>
                    <strong>{currencySymbols[currency]}{price.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="holding-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <small>{percentage.toFixed(1)}% of portfolio</small>
                </div>
                <button
                  className="btn-remove"
                  onClick={() => removeCoin(item._id, item.coin)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Portfolio;
