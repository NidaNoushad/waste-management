import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const StaffPerformance = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/staff/pickups/overall-dashboard/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (!data) return <p className="text-center mt-5">Loading...</p>;

  const pieColors = ["#f97316", "#3b82f6", "#10b981", "#ef4444"];

  const { summary,  tasks_progress, completion_trend } = data;

  const tasksPercent = tasks_progress.tasks_total
    ? Math.round((tasks_progress.tasks_completed / tasks_progress.tasks_total) * 100)
    : 0;
    const status_distribution = data.status_distribution.map(item => {
      if (item.name === "Pending") return { ...item, name: "Assigned" };
      return item;
    });
  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Overall Performance Dashboard</h2>

      {/* --- Summary Cards --- */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Pickups", value: summary.total_pickups },
          { label: "Completed Pickups", value: summary.completed },
          { label: "Pending Pickups", value: summary.assigned },
          { label: "On The Way", value: summary.on_the_way },
          { label: "Cancelled Pickups", value: summary.cancelled },
          { label: "COD to Collect", value: `₹${summary.cod_to_collect}` },
          { label: "Collected Amount", value: `₹${summary.collected}` },
        ].map((item, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="card shadow-sm text-center p-3">
              <h3>{item.value}</h3>
              <p className="text-muted">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- Tasks Completed vs Total Assigned --- */}
      <div className="card mb-4 shadow-sm p-3">
        <h5 className="mb-3">Tasks Completed vs Total Assigned</h5>
        <div className="progress" style={{ height: "25px" }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${tasksPercent}%` }}
            aria-valuenow={tasks_progress.tasks_completed}
            aria-valuemin="0"
            aria-valuemax={tasks_progress.tasks_total}
          >
            {tasksPercent}%
          </div>
        </div>
        <p className="mt-2 text-muted">
          {tasks_progress.tasks_completed} / {tasks_progress.tasks_total} tasks completed
        </p>
      </div>

      <div className="row g-3">
        {/* --- Pickup Status Distribution Pie Chart --- */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">Pickup Status Distribution</h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={status_distribution}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Completion % Trend Line Chart --- */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">Completion % Trend</h5>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={completion_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="completion_percent" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPerformance;
