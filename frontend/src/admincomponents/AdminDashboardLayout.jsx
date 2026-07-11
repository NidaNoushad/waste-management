import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Container, Button } from "react-bootstrap";
import { Outlet } from "react-router-dom";

const AdminDashboardLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <AdminSidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Main content */}
      <div className="flex-grow-1">
   
        <Button
          variant="success"
          className="m-2 d-md-none"
          onClick={() => setShowSidebar(true)}
        >
          ☰ Menu
        </Button>

        <Container fluid className="p-3">
          {/* Render admin pages  */}
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
