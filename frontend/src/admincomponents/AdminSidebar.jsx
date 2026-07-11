import React, { useState } from "react";
import { Nav, Modal, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/UserSidebar.css";

const AdminSidebar = ({ show, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("is_superuser");

    navigate("/admin/login");
    setShowLogoutModal(false);
    onClose();
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/Admindashboard" },
    { name: "Manage Users", path: "/admin/manageuser" },
    { name: "Customer Message", path: "/admin/messages" },
    { name: "pickupDate", path: "/admin/city" },
    { name: "Staff List", path: "/admin/stafflist" },
    { name: "Add Staff", path: "/admin/addstaff" },
    { name: "Staff Reports", path: "/admin/staffreport" },
    { name: "Logout", path: "/admin/logout" },
  ];

  return (
    <>
      <div className={`sidebar-container ${show ? "show" : ""}`}>
        <div className="sidebar-header">
          <h2>GoTrash Admin</h2>
          <button className="btn-close d-md-none" onClick={onClose}></button>
        </div>

        <Nav className="flex-column">
          {menuItems.map((item, index) => (
            <Nav.Link
              key={index}
              onClick={() => {
                if (item.name === "Logout") {
                  setShowLogoutModal(true);
                } else {
                  navigate(item.path);
                  onClose();
                }
              }}
              className={`sidebar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              {item.name}
            </Nav.Link>
          ))}
        </Nav>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowLogoutModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Yes, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminSidebar;
