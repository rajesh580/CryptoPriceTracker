import React, { useState } from "react";

function TimeframeSelector({ onTimeframeChange }) {
  const [selected, setSelected] = useState("all");

  const timeframes = [
    { id: "1h", label: "1h", days: 0.042 },
    { id: "24h", label: "24h", days: 1 },
    { id: "7d", label: "7d", days: 7 },
    { id: "30d", label: "30d", days: 30 },
    { id: "all", label: "All" }
  ];

  const handleSelect = (timeframeId) => {
    setSelected(timeframeId);
    const timeframe = timeframes.find(tf => tf.id === timeframeId);
    onTimeframeChange(timeframe);
  };

  return (
    <div className="timeframe-selector">
      {timeframes.map((tf) => (
        <button
          key={tf.id}
          className={`timeframe-btn ${selected === tf.id ? "active" : ""}`}
          onClick={() => handleSelect(tf.id)}
          title={tf.label}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}

export default TimeframeSelector;
