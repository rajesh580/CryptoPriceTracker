import React, { useEffect, useState } from "react";
import "./AlertManagement.css";

function AlertManagement() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/alerts", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setAlerts(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      setLoading(false);
    }
  };

  const deleteAlert = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      await fetch(`http://localhost:5000/api/alerts/${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      setAlerts(alerts.filter(alert => alert._id !== id));
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  };

  const getConditionLabel = (condition, threshold) => {
    return condition === "above" 
      ? `Price goes above $${threshold}` 
      : `Price drops below $${threshold}`;
  };

  const getStatusBadge = (isTriggered) => {
    return isTriggered ? (
      <span className="badge badge-triggered">Triggered ✓</span>
    ) : (
      <span className="badge badge-active">Active</span>
    );
  };

  return (
    <div className="alert-management">
      <h2>Your Price Alerts</h2>
      <p className="subtitle">Manage and monitor your cryptocurrency price alerts</p>

      {loading ? (
        <div className="loading-state">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No alerts yet</p>
          <small>Create an alert using the Set Alert form to monitor prices</small>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert._id} className="alert-item">
              <div className="alert-header">
                <div className="alert-info">
                  <h4>{alert.coinId.toUpperCase()}</h4>
                  <p>{getConditionLabel(alert.condition, alert.threshold)}</p>
                </div>
                <div className="alert-meta">
                  {getStatusBadge(alert.isTriggered)}
                  <span className="alert-date">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="alert-actions">
                <button 
                  className="btn-delete"
                  onClick={() => deleteAlert(alert._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertManagement;
