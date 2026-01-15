import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function AlertForm() {
  const [coinId, setCoinId] = useState("bitcoin");
  const [threshold, setThreshold] = useState("");
  const [condition, setCondition] = useState("above");

  const submitAlert = async (e) => {
    e.preventDefault();

    if (!threshold || parseFloat(threshold) <= 0) {
      alert("Please enter a valid price threshold");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post("http://localhost:5000/api/alerts", {
        coinId,
        threshold: parseFloat(threshold),
        condition
      }, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });

      console.log("Alert created:", response.data);
      alert("Alert Created Successfully!");
      setThreshold("");
    } catch (error) {
      console.error("Failed to create alert:", error.message);
      alert("Failed to create alert: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="alert-form">
      <h2>Create Price Alert</h2>

      <form onSubmit={submitAlert}>
        <select value={coinId} onChange={(e) => setCoinId(e.target.value)}>
          <option value="bitcoin">Bitcoin</option>
          <option value="ethereum">Ethereum</option>
          <option value="solana">Solana</option>
          <option value="dogecoin">Dogecoin</option>
          <option value="cardano">Cardano</option>
        </select>

        <input
          type="number"
          placeholder="Enter price threshold"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          required
        />

        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>

        <button type="submit">Set Alert</button>
      </form>
    </div>
  );
}

export default AlertForm;
