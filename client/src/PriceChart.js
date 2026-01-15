import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import TimeframeSelector from "./TimeframeSelector";
import "./App.css";

function PriceChart({ coin, data }) {
  const [timeframe, setTimeframe] = useState({ id: "all", days: null });

  // Filter data based on selected timeframe
  const getFilteredData = () => {
    if (!data || data.length === 0) return [];
    
    if (timeframe.id === "all") {
      return data;
    }

    const now = new Date();
    const cutoffTime = new Date(now.getTime() - timeframe.days * 24 * 60 * 60 * 1000);
    
    // Since we don't have actual timestamps, estimate based on position
    const daysAgo = timeframe.days;
    const startIndex = Math.max(0, data.length - Math.ceil(daysAgo * 24)); // rough estimate
    return data.slice(startIndex);
  };

  const chartData = getFilteredData();
  
  // If only one data point, duplicate it to show a line
  const displayData = chartData.length === 1 
    ? [
        { ...chartData[0], time: "Previous" },
        { ...chartData[0], time: "Current" }
      ]
    : chartData.length === 0 ? [] : chartData;

  const isLoading = data.length === 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{payload[0].payload.time}</p>
          <p className="tooltip-price">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-box">
      <div className="chart-header">
        <h3>
          {coin.toUpperCase()} Price Chart
          <span className="data-count">({displayData.length} points)</span>
        </h3>
        <TimeframeSelector onTimeframeChange={setTimeframe} />
      </div>

      {isLoading ? (
        <p className="loading-text">Loading chart data...</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={displayData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${coin}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={["auto", "auto"]}
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              strokeWidth={3}
              stroke="#2563eb"
              dot={{ fill: '#2563eb', r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default PriceChart;
