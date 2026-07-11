import { useState, useEffect } from "react";
import { Container, Table, Spinner, Alert,Button, Form  } from "react-bootstrap";
import StaffDetail from "./StaffDetail";

const StaffList = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch("http://127.0.0.1:8000/api/stafflist/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStaffList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  if (loading) return <Spinner animation="border" />;
   // Toggle Active/Inactive
  const toggleActive = async (staffId, currentStatus) => {
    try {
      const token = localStorage.getItem("access");
      await fetch(`http://127.0.0.1:8000/api/stafflist/${staffId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      fetchStaff(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Staff
  const deleteStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;
    try {
      const token = localStorage.getItem("access");
      await fetch(`http://127.0.0.1:8000/api/stafflist/${staffId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStaff(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Container className="mt-4">
      <h2>Staff List</h2>
      {staffList.length === 0 ? (
        <Alert variant="info">No staff found</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff, index) => (
              <tr key={staff.id}>
                <td>{index + 1}</td>
                <td onClick={() => setSelectedStaff(staff)}>{staff.full_name}</td>
                <td>{staff.email}</td>
                <td>{staff.phone}</td>
                <td>
                  <Form.Check
                    type="switch"
                    checked={staff.is_active}
                    onChange={() => toggleActive(staff.id, staff.is_active)}
                  />
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteStaff(staff.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {selectedStaff && (
        <StaffDetail
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          refreshList={fetchStaff}
        />
      )}
    </Container>
  );
};

export default StaffList;

