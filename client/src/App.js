import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import PriceChart from "./PriceChart";
import AlertForm from "./AlertForm";
import AlertPopup from "./AlertPopup";
import AlertManagement from "./AlertManagement";
import Portfolio from "./Portfolio";
import Auth from "./Auth";
import Comparison from "./Comparison";
import Analytics from "./Analytics";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const coins = ["bitcoin", "ethereum", "solana", "dogecoin", "cardano"];
  const [priceHistory, setPriceHistory] = useState({});
  const [popup, setPopup] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [priceChanges, setPriceChanges] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const currency = "usd"; // Fixed to USD

  // Check authentication on mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");
    
    if (authToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Calculate price changes
  useEffect(() => {
    const changes = {};
    coins.forEach((coin) => {
      const data = priceHistory[coin];
      if (data && data.length >= 2) {
        const current = data[data.length - 1].price;
        const previous = data[0].price;
        const change = ((current - previous) / previous) * 100;
        changes[coin] = change;
      }
    });
    setPriceChanges(changes);
  }, [priceHistory]);

  // Fetch historical prices on component mount
  useEffect(() => {
    const fetchHistoricalPrices = async () => {
      try {
        for (let coin of coins) {
          const response = await fetch(`http://localhost:5000/api/prices/history/${coin}`);
          const history = await response.json();
          
          // Transform data to match the format we use
          const formattedData = history.map((item) => ({
            time: new Date(item.fetchedAt).toLocaleTimeString(),
            price: item.price
          }));

          setPriceHistory((prev) => ({
            ...prev,
            [coin]: formattedData
          }));
        }
      } catch (error) {
        console.error("Failed to fetch historical prices:", error);
      }
    };

    fetchHistoricalPrices();
  }, []);

  useEffect(() => {
    socket.on("priceUpdate", ({ prices, timestamp }) => {
      const time = new Date(timestamp).toLocaleTimeString();

      setPriceHistory((prev) => {
        const updated = { ...prev };

        coins.forEach((coin) => {
          const existing = updated[coin] || [];
          updated[coin] = [
            ...existing.slice(-20),
            { time, price: prices[coin].usd }
          ];
        });

        return updated;
      });
    });

    socket.on("alertTriggered", (data) => {
      setPopup(data);
      setTimeout(() => setPopup(null), 5000);
    });

    return () => {
      socket.off("priceUpdate");
      socket.off("alertTriggered");
    };
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("dashboard");
  };

  // Show Auth page if not logged in
  if (!user && !loading) {
    return <Auth onLogin={setUser} />;
  }

  if (loading) {
    return <div className="app"><div className="container"><p>Loading...</p></div></div>;
  }
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="navbar-title">Crypto Tracker</h1>
          <div className="nav-menu">
            <button
              className={`nav-btn ${currentPage === "dashboard" ? "active" : ""}`}
              onClick={() => setCurrentPage("dashboard")}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-btn ${currentPage === "portfolio" ? "active" : ""}`}
              onClick={() => setCurrentPage("portfolio")}
            >
              💼 Portfolio
            </button>
            <button
              className={`nav-btn ${currentPage === "alerts" ? "active" : ""}`}
              onClick={() => setCurrentPage("alerts")}
            >
              🔔 Alerts
            </button>
            <button
              className={`nav-btn ${currentPage === "comparison" ? "active" : ""}`}
              onClick={() => setCurrentPage("comparison")}
            >
              🔄 Compare
            </button>
            <button
              className={`nav-btn ${currentPage === "analytics" ? "active" : ""}`}
              onClick={() => setCurrentPage("analytics")}
            >
              📈 Analytics
            </button>
            <button
              className="nav-btn theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              className="nav-btn logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              🚪 Logout ({user?.email})
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        {popup && <AlertPopup data={popup} />}

        {currentPage === "dashboard" && (
          <>
            <h1 className="page-title">Crypto Price Tracker</h1>
            <div className="card-grid">
              {coins.map((coin) => {
                const latest = priceHistory[coin]?.slice(-1)[0]?.price;
                const change = priceChanges[coin] || 0;
                const isPositive = change >= 0;

                return (
                  <div key={coin} className={`price-card ${isPositive ? "positive" : "negative"}`}>
                    <h3>{coin.toUpperCase()}</h3>
                    <p>${latest || "Loading..."}</p>
                    <div className="price-change">
                      <span className={`change-indicator ${isPositive ? "up" : "down"}`}>
                        {isPositive ? "📈" : "📉"} {change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="main-content">
              <div className="chart-container">
                {coins.map((coin) => (
                  <PriceChart
                    key={coin}
                    coin={coin}
                    data={priceHistory[coin] || []}
                  />
                ))}
              </div>

              <AlertForm />
            </div>
          </>
        )}

        {currentPage === "portfolio" && <div className="page-content"><Portfolio /></div>}
        {currentPage === "alerts" && <div className="page-content"><AlertManagement /></div>}
        {currentPage === "comparison" && <div className="page-content"><Comparison /></div>}
        {currentPage === "analytics" && <div className="page-content"><Analytics priceHistory={priceHistory} /></div>}
      </div>
    </div>
  );
}

export default App;
