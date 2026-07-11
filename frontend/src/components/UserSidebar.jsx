import React, { useEffect ,useState} from "react";
import { Nav, Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./UserSidebar.css";
import { useLocation } from "react-router-dom";

const UserSidebar = ({ show, onClose }) => {
  const navigate = useNavigate();
  const location=useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Redirect to login
    navigate("/login");
    setShowLogoutModal(false);
    onClose();
  };

  const menuItems = [
    { name: "Dashboard", path: "/userdashboard" },
    { name: "New Waste Request", path: "/new-request" },
    { name: "My Request", path: "/myrequests" },
    { name: "Track Pickup", path: "/trackpickup" },
    { name: "Payment History", path: "/paymenthistory" },
    // { name: "Waste Categories Guide", path: "/waste-guide" },
    { name: "Feedback", path: "/feedback" },
    { name: "Support / Contact Us", path: "/contactus" },
    { name: "Profile Management", path: "/myprofile" },
    { name: "Home", path: "/" },
    { name: "Logout", path: "/logout" }
  ];

  return (
    

    <>
      <div
        className={`sidebar-container ${show ? "show" : ""}`}
        data-aos="fade-right"
      >
        <div className="sidebar-header">
          <h2>GoTrash</h2>
          <button className="btn-close d-md-none" onClick={onClose}></button>
        </div>
        <Nav className="flex-column">
          {menuItems.map((item, index) => (
            <Nav.Link
              key={index}
              onClick={() => {
                if (item.name === "Logout") {
                  setShowLogoutModal(true); // show confirmation
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
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
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

export default UserSidebar;
