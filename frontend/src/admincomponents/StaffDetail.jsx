import { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const StaffDetail = ({ staff, onClose, refreshList }) => {
  const [areas, setAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch("http://127.0.0.1:8000/api/adminpanel/areas/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAreas(data);
        // Preselect current staff areas
        const staffAreaIds = staff.areas.map(a => a.id);
        setSelectedAreas(staffAreaIds);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAreas();
  }, [staff]);

  const handleAreaChange = (e) => {
    const value = parseInt(e.target.value);
    if (e.target.checked) {
      setSelectedAreas([...selectedAreas, value]);
    } else {
      setSelectedAreas(selectedAreas.filter(id => id !== value));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(
        `http://127.0.0.1:8000/api/adminpanel/staff/${staff.id}/assign-areas/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ areas: selectedAreas }),
        }
      );
      if (!res.ok) throw new Error("Failed to assign areas");
      refreshList();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{staff.full_name} Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><b>Email:</b> {staff.email}</p>
        <p><b>Phone:</b> {staff.phone}</p>

        <Form>
          <Form.Label>Assign Areas</Form.Label>
          <div>
            {areas.map(area => (
              <Form.Check
                key={area.id}
                type="checkbox"
                label={area.name}
                value={area.id}
                checked={selectedAreas.includes(area.id)}
                onChange={handleAreaChange}
              />
            ))}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StaffDetail;
