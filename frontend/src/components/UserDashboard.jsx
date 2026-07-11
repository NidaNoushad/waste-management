

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
  Bell, Calendar, Clock, DollarSign, Package,
  TrendingUp, User, CheckCircle, AlertCircle, Truck
} from 'lucide-react';
import './UserDashboard.css';

const UserDashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // JWT from login
        const res = await axiosInstance.get("user-dashboard/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  if (!dashboardData) {
    return <div className="text-center py-5">Loading dashboard...</div>;
  }

  const { user, quickStats, pendingPayments, upcomingSchedule, monthlyData, notifications } = dashboardData;

  // Reusable card for stats
  const StatCard = ({ icon: Icon, title, value, color, delay }) => (
    <div
      className={`card stat-card mb-3 shadow-sm ${isLoaded ? 'loaded' : ''}`}
      style={{ borderLeft: `5px solid ${color}`, transitionDelay: `${delay}ms` }}
    >
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <p className="text-muted mb-1">{title}</p>
          <h3 style={{ color }}>{value}</h3>
        </div>
        <div className="icon-circle" style={{ backgroundColor: `${color}33` }}>
          <Icon className="icon" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const NotificationItem = ({ notification }) => {
    const getIcon = (type) => {
      switch (type) {
        case 'success': return <CheckCircle className="text-success me-2" />;
        case 'warning': return <AlertCircle className="text-warning me-2" />;
        default: return <Bell className="text-primary me-2" />;
      }
    };

    return (
      <div className="d-flex align-items-start p-2 notification-item rounded mb-2">
        {getIcon(notification.type)}
        <div>
          <p className="mb-1">{notification.message}</p>
          <small className="text-muted">{notification.time}</small>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-bg min-vh-100">
      <div className="container py-4">
        {/* Header */}
        <div className={`header-card card mb-4 shadow-lg ${isLoaded ? 'loaded' : ''}`}>
          <div className="card-body d-flex align-items-center">
            <div className="bg-white p-2 rounded-circle me-3">
              <User className="icon-lg text-primary" />
            </div>
            <div>
              <h1 className="h3 mb-1">Welcome back, {user.name}!</h1>
              <p className="text-muted mb-0">Here's what's happening with your pickups today.</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-md-6 col-lg-3">
            <StatCard icon={Package} title="Total Requests" value={quickStats.totalRequests} color="#0d6efd" delay={100} />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard icon={Clock} title="Active Requests" value={quickStats.activeRequests} color="#198754" delay={200} />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard icon={CheckCircle} title="Completed Pickups" value={quickStats.completedPickups} color="#6f42c1" delay={300} />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard icon={DollarSign} title="Pending Payments" value={quickStats.pendingPayments} color="#ffc107" delay={400} />
          </div>
        </div>

        <div className="row">
          {/* Left Column */}
          <div className="col-lg-8 mb-4">
            {/* Monthly Pickup Trend */}
            <div className={`card mb-4 shadow-sm chart-card ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '500ms' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title d-flex align-items-center mb-0">
                    <TrendingUp className="me-2 text-primary" /> Monthly Pickup Trend
                  </h5>
                </div>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorPickups" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#343a40', border: 'none', borderRadius: '8px', color: 'white' }}/>
                      <Area type="monotone" dataKey="pickups" stroke="#0d6efd" strokeWidth={3} fill="url(#colorPickups)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className={`card shadow-sm ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '600ms' }}>
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center mb-3">
                  <DollarSign className="me-2 text-warning" /> Pending Payments
                </h5>
                {pendingPayments.length === 0 && <p className="text-muted">No pending payments 🎉</p>}
                {pendingPayments.map(payment => (
                  <div key={payment.id} className="d-flex justify-content-between align-items-center p-3 mb-2 rounded bg-warning bg-opacity-10">
                    <div>
                      <p className="mb-1">{payment.description}</p>
                      <small className="text-muted">{payment.date}</small>
                    </div>
                    <div className="text-end">
                      <p className="mb-1 fw-bold text-warning">₹{payment.amount}</p>
                      {/* <button className="btn btn-sm btn-primary">Pay Now</button> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-4">
            {/* Next Schedule */}
            <div className={`card mb-4 shadow-sm ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '700ms' }}>
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center mb-3">
                  <Calendar className="me-2 text-success" /> Next Schedule
                </h5>
                {upcomingSchedule ? (
                  <div className="p-3 rounded bg-success bg-opacity-10 border border-success">
                    <div className="d-flex align-items-center mb-3">
                      <Truck className="me-2 text-success" />
                      <div>
                        <p className="mb-0 fw-bold text-success">{upcomingSchedule.type}</p>
                        <small className="text-success">Upcoming Pickup</small>
                      </div>
                    </div>
                    <p><Calendar className="me-1 text-success" /> {upcomingSchedule.date}</p>
                    <p><Clock className="me-1 text-success" /> {upcomingSchedule.time}</p>
                    <p>📍 {upcomingSchedule.location}</p>
                    <button className="btn btn-success w-100 mt-2"
                     onClick={() => navigate("/trackpickup")}
                    
                    >Track Pickup</button>
                  </div>
                ) : (
                  <p className="text-muted">No upcoming pickups scheduled</p>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className={`card shadow-sm ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '800ms' }}>
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center mb-3">
                  <Bell className="me-2 text-primary" /> Recent Updates
                  <span className="badge bg-danger ms-2">
                    {notifications.filter(n => n.type === 'warning').length}
                  </span>
                </h5>
                <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                  {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
