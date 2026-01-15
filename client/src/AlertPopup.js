import React from "react";
import "./App.css";

function AlertPopup({ data }) {
  return (
    <div className="popup">
      <h3>🚨 Price Alert Triggered</h3>
      <p>{data.coin.toUpperCase()} is now ${data.price}</p>
      <p>
        Condition: {data.condition} {data.threshold}
      </p>
    </div>
  );
}

export default AlertPopup;
