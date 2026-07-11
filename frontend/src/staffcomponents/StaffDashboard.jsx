


import React, { useState,useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import axios from "axios";
import "./StaffDashboard.css"; // external CSS

const StaffDashboard = () => {
 

  
  const [dashboardData, setDashboardData] = useState(null);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}staff/pickups/dashboard/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`, // if JWT auth
          },
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };

    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return <p>Loading dashboard...</p>;
  }

  const pieColors = ["#ef4444", "#10b981", "#3b82f6"];
  const statusPieData = [
    { name: "Pending", value: dashboardData.assigned },
    { name: "On the Way", value: dashboardData.on_the_way },
    { name: "Completed", value: dashboardData.completed },
  ];

  return (
    <div className="staff-dashboard bg-light min-vh-100">
      <div className="container-fluid p-3 p-md-4">
        {/* Welcome Message */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="mb-1">Welcome, {dashboardData.staff_name}!</h2>
            <p className="text-muted">Here’s your daily pickup summary.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card summary-card">
              <h3>{dashboardData.total_pickups}</h3>
              <p>Total Pickups</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card summary-card">
              <h3>{dashboardData.assigned}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card summary-card">
              <h3>{dashboardData.on_the_way}</h3>
              <p>On the Way</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card summary-card">
              <h3>{dashboardData.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* COD & Collected Money */}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <div className="card summary-card">
              <h3>₹{dashboardData.cod_to_collect}</h3>
              <p>Total COD</p>
            </div>
          </div>
          <div className="col-6">
            <div className="card summary-card">
              <h3>₹{dashboardData.collected}</h3>
              <p>Total Collected</p>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotification && (
          <div className="notifications-panel mb-4 p-3 shadow-sm rounded bg-white">
            <ul className="mb-2">
              <li>📌 You have {dashboardData.new_pickups} new pickups today.</li>
              <li>❌ {dashboardData.cancelled_today} pickups cancelled</li>
              {dashboardData.upcoming_pickups.map((p, i) => (
                <li key={`upcoming-${i}`}>⏰ Upcoming pickup: Order {p.order_id} at {p.pickup_time}</li>
              ))}
              {dashboardData.urgent_pickups.map((p, i) => (
                <li key={`urgent-${i}`}>⚠️ Urgent pickup: Order {p.order_id} at {p.pickup_time}</li>
              ))}
              {/* {dashboardData.delayed_pickups.map((p, i) => (
                <li key={`delayed-${i}`}>⏳ Delayed pickup: Order {p.order_id} scheduled at {p.pickup_time}</li>
              ))} */}
            </ul>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowNotification(false)}>Dismiss</button>
          </div>
        )}

        {/* Pie Chart & Day Progress */}
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="card p-3 shadow-sm">
              <h5 className="mb-3">Task Status Distribution</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card p-3 shadow-sm">
              <h5 className="mb-3">Day Progress</h5>
              <p>{dashboardData.completed} / {dashboardData.total_pickups} pickups completed</p>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${(dashboardData.completed/dashboardData.total_pickups)*100}%` }} 
                  aria-valuenow={dashboardData.completed} 
                  aria-valuemin="0" 
                  aria-valuemax={dashboardData.total_pickups}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

