import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Table, Spinner, Button } from "react-bootstrap";

const RequestStatusList = () => {
  const { userId } = useParams();
  const [pickups, setPickups] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pickups
  const fetchPickups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(
        `http://127.0.0.1:8000/api/waste-request-status/?user=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setPickups(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load pickups");
    } finally {
      setLoading(false);
    }
  };

  
const fetchStaff = async () => {
  try {
    const token = localStorage.getItem("access");
    const res = await fetch("http://127.0.0.1:8000/api/activestaff/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStaffList(data);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchStaff();
    fetchPickups();
  }, [userId]);

  // Handlers
  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem("access");
    await fetch(`http://127.0.0.1:8000/api/waste-request-status/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchPickups();
  };

  const handleAssignStaff = async (id, staffId) => {
    console.log("Assigning staff:", staffId, "to request:", id); 
    const token = localStorage.getItem("access");
    await fetch(`http://127.0.0.1:8000/api/waste-request-status/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assigned_staff_id: staffId ? parseInt(staffId) : null }),

    });
    fetchPickups();
  };

  const handleDeletePickup = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pickup?")) return;
    const token = localStorage.getItem("access");
    await fetch(`http://127.0.0.1:8000/api/waste-request-status/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPickups();
  };

  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );

  return (
    <Container className="mt-4">
      <h3>Per-Pickup Status</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Order ID</th>
            <th>Customer</th>
      <th>Address</th>
      <th>Category</th>
      <th>Waste Type</th>
            <th>Pickup Date</th>
            <th>Status</th>
            <th>Assigned Staff</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pickups.map((p, index) => (
            <tr key={p.id}>
              <td>{index + 1}</td>
              <td>{p.waste_request_id || p.order_id}</td>
        <td>{p.customer}</td>
        <td>{p.address}</td>
        <td>{p.category}</td>
        <td>{p.waste_type}</td>
    
              <td>{p.pickup_date}</td>
              <td>
                <select
                  value={p.status}
                  onChange={(e) => handleStatusChange(p.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="On the Way">On the Way</option>
                  <option value="Complete">Complete</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td>
              <select
  value={p.assigned_staff?.id || ""}
  onChange={(e) => handleAssignStaff(p.id, e.target.value)}
>
  <option value="">Not Assigned</option>
  {staffList.map((staff) => (
    <option key={staff.id} value={staff.id}>
      {staff.username} ({staff.areas.map(a => a.name).join(", ")})
    </option>
  ))}
</select>
              </td>
              <td>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeletePickup(p.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default RequestStatusList;
