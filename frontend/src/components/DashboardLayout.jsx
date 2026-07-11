import React, { Children, useState,useEffect } from "react";
import Sidebar from "./UserSidebar";
import { Container, Button } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
const DashboardLayout = () => {

  const [showSidebar, setShowSidebar] = useState(false);
  useEffect(() => {
  
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("profile/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        console.log("User profile loaded:", res.data);
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Main content */}
      <div className="flex-grow-1">
        {/* Toggle button only on mobile */}
        <Button
          variant="success"
          className="m-2 d-md-none"
          onClick={() => setShowSidebar(true)}
        >
          ☰ Menu
        </Button>

        <Container fluid className="p-3">
          {/* {children} */}
          <Outlet/>
        </Container>
      </div>
    </div>
  );
};

export default DashboardLayout;
