

// src/components/StaffLayout.jsx
import React, { useState, useEffect } from "react"; 
import axios from "axios";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";


const StaffLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarData, setSidebarData] = useState(null);
  const monthName = new Date().toLocaleString("default", { month: "long" });
  const total = sidebarData?.stats?.tasks || 0;
const completed = sidebarData?.stats?.complete || 0;
const completionRate =
  total > 0 ? Math.round((completed / total) * 100) : 0;

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) throw new Error("No refresh token");
  
      const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
        refresh,
      });
  
      localStorage.setItem("access", res.data.access);
      return res.data.access;
    } catch (err) {
      console.error("Refresh token failed", err);
      // Force logout if refresh fails
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/staff/login");
      return null;
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, // success, do nothing
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // prevent infinite loop
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest); // retry the failed request
          }
        }
        return Promise.reject(error);
      }
    );
  
    return () => axios.interceptors.response.eject(interceptor); // cleanup
  }, []);
  

  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/staff/pickups/profile-sidebar/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSidebarData(res.data);
      } catch (err) {
        console.error("Error fetching sidebar data", err);
      }
    };
    fetchSidebar();
  }, []);

  if (!sidebarData) return <div>Loading...</div>;

  const handleLogoutConfirm = () => {
    // 🔹 Clear tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setShowLogoutModal(false);

    // 🔹 Redirect to login
    navigate("/staff/login");
  };

  const menuItems = [
    { path: "/staff/staffdashboard", icon: "⏰", label: "Dashboard" },
    { path: "/staff/tasks", icon: "📋", label: "Tasks" },
    { path: "/staff/performance", icon: "📊", label: "Performance" },
    { icon: "🚪", label: "Logout", isLogout: true }, 
    
  ];

  return (
    <div className="container-fluid" style={{ background: "#f0f8ff", minHeight: "100vh" }}>
      <div className="row">
        {/* Left Sidebar */}
        <div className="col-lg-1 col-md-2 d-none d-md-block" style={{ background: "#fff", minHeight: "100vh" }}>
          <div className="d-flex flex-column align-items-center pt-4 gap-4">
            {menuItems.map((item) =>
            item.isLogout ? (
              <span
                key={item.path}
                onClick={() => setShowLogoutModal(true)}
                style={{
                  cursor: "pointer",
                  opacity: 0.7,
                  fontSize: "22px",
                }}
                title={item.label}
              >
                {item.icon}
              </span>
            ) :
            
            
            
            (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: "none",
                  opacity: location.pathname === item.path ? 1 : 0.5,
                  fontSize: "22px",
                }}
              >
                <span title={item.label}>{item.icon}</span>
              </Link>
            ))}
          </div>
        </div>
         {/* ✅ Logout Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogoutConfirm}>
            Yes, Logout
          </Button>
        </Modal.Footer>
      </Modal>

        {/* Main Content */}
        <div className="col-lg-7 col-md-6 col-12 p-4">
          <Outlet /> {/* Dynamic Page Content */}
        </div>

        {/* Right Sidebar */}
        <div className="col-lg-4 col-md-4 col-12">
          <div
            style={{
              background: "linear-gradient(135deg, #0f4c75 0%, #3282b8 50%, #4CAF50 100%)",
              borderRadius: "20px",
              padding: "30px",
              color: "white",
              minHeight: "100vh",
            }}
          >
            {/* Settings */}
            <div className="text-end mb-4">
              <span style={{ fontSize: "24px" }}>⚙️</span>
            </div>

            {/* Profile */}
            <div className="text-center mb-4">
              <div className="mb-3">
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#fff",
                    borderRadius: "50%",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "30px" }}>👨‍💼</span>
                </div>
              </div>
              <h4 style={{ fontWeight: "bold", marginBottom: "5px" }}>{sidebarData.staff_name}</h4>
              <small style={{ opacity: 0.8 }}>{sidebarData.role}</small>
            </div>

            {/* Working Hours */}
            <div className="mb-4">
              <h6 style={{ fontWeight: "bold", marginBottom: "15px" }}>Working hours:</h6>
              <div className="row">
                <div className="col-6">
                  <small style={{ opacity: 0.8 }}>Work Start</small>
                  <div className="p-2 text-center rounded" style={{ background: "rgba(255,255,255,0.2)" }}>
                  {sidebarData.work_start}
                  </div>
                </div>
                <div className="col-6">
                  <small style={{ opacity: 0.8 }}>Work End</small>
                  <div className="p-2 text-center rounded" style={{ background: "rgba(255,255,255,0.2)" }}>
                  {sidebarData.work_end}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
          
            {/* <div className="mb-4">
              <h4 style={{ fontWeight: "bold", marginBottom: "20px" }}>Statistics on July</h4>
              <div className="text-center mb-3">
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    border: "8px solid #4CAF50",
                    borderRadius: "50%",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderTopColor: "#81c784",
                  }}
                >
                  <span style={{ fontSize: "30px" }}>🌟</span>
                </div>
              </div>
           </div> */}
            {/* Stats */}
<div className="mb-4">
  <h4 style={{ fontWeight: "bold", marginBottom: "20px" }}>Statistics on {monthName}</h4>
  <div className="text-center mb-3" style={{ position: "relative" }}>
  <div
    style={{
      width: "120px",
      height: "120px",
      border: "8px solid #4CAF50",
      borderRadius: "50%",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTopColor: "#81c784",
      fontWeight: "bold",
      fontSize: "22px",
      background: `conic-gradient(
        #4CAF50 ${sidebarData.stats.progress.completed_percent.toFixed(2)}%, 
        rgba(255,255,255,0.2) 0
      )`,
      // background: "rgba(255,255,255,0.1)",
      color: "#fff"
    }}
  >
    {sidebarData.stats.progress.completed_percent.toFixed(2)}%
  </div>

  {/* Small star badge */}
  <span
    style={{
      position: "absolute",
      top: "0",
      right: "38%",
      fontSize: "20px"
    }}
  >
    🌟
  </span>

  <small
    style={{
      display: "block",
      marginTop: "10px",
      opacity: 0.8,
      color: "#fff"
    }}
  >
    Completion Rate
  </small>
</div>

  
  {/* Tasks */}
  <div className="mb-3">
    <div className="d-flex justify-content-between">
      <span>Tasks</span>
      <span>{sidebarData.stats.tasks}  ({sidebarData.stats.progress.tasks_percent.toFixed(2)}%)</span>
    </div>
    <div className="progress" style={{ height: "6px" }}>
      <div
        className="progress-bar bg-primary"
        role="progressbar"
        style={{ width: `${sidebarData.stats.progress.tasks_percent}%` }}
      ></div>
    </div>
  </div>

  {/* Completed */}
  <div className="mb-3">
    <div className="d-flex justify-content-between">
      <span>Completed</span>
      <span>{sidebarData.stats.complete} ({sidebarData.stats.progress.completed_percent.toFixed(2)}%)</span>
    </div>
    <div className="progress" style={{ height: "6px" }}>
      <div
        className="progress-bar bg-success"
        role="progressbar"
        style={{ width: `${sidebarData.stats.progress.completed_percent} %` }}
      ></div>
    </div>
  </div>

  {/* Hours */}
  <div className="mb-3">
    <div className="d-flex justify-content-between">
      <span>Hours</span>
      <span>{sidebarData.stats.hours} ({sidebarData.stats.progress.hours_percent.toFixed(2)}%)</span>
    </div>
    <div className="progress" style={{ height: "6px" }}>
      <div
        className="progress-bar bg-warning"
        role="progressbar"
        style={{ width: `${sidebarData.stats.progress.hours_percent}%` }}
      ></div>
    </div>
  </div>
</div>


            {/* Location */}
            <div className="mb-4">
              <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                {/* Sukabumi City */}
                {sidebarData.location.city}</h3>
              <small style={{ opacity: 0.8 }}>
                {/* Sukabumi, Indonesia • GMT+7 */}
                {sidebarData.location.timezone} </small>
            </div>

            {/* City Illustration */}
            <div className="text-center">
              <div
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(76,175,80,0.3) 100%)",
                  borderRadius: "15px",
                  padding: "20px",
                  minHeight: "200px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Buildings */}
                <div className="position-absolute bottom-0 left-0 right-0 d-flex align-items-end justify-content-center">
                  {[
                    { w: 30, h: 80, c: "#4CAF50" },
                    { w: 25, h: 100, c: "#2e7d32" },
                    { w: 35, h: 120, c: "#66bb6a" },
                    { w: 20, h: 60, c: "#81c784" },
                    { w: 40, h: 90, c: "#a5d6a7" },
                  ].map((b, i) => (
                    <div
                      key={i}
                      style={{
                        width: `${b.w}px`,
                        height: `${b.h}px`,
                        background: b.c,
                        borderRadius: "4px 4px 0 0",
                        marginRight: "5px",
                      }}
                    ></div>
                  ))}
                </div>

                {/* Trees */}
                <div className="position-absolute bottom-0 left-0">
                  <span style={{ fontSize: "40px" }}>🌴</span>
                </div>
                <div className="position-absolute bottom-0 right-0">
                  <span style={{ fontSize: "30px" }}>🌳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;

