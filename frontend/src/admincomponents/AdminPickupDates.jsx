import { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";

const AdminPickupDates = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [dates, setDates] = useState([""]); // start with one input
  const [loading, setLoading] = useState(true);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      const res = await fetch("http://127.0.0.1:8000/api/cities/");
      const data = await res.json();
      setCities(data);
      setLoading(false);
    };
    fetchCities();
  }, []);

  const handleDateChange = (index, value) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
  };

  const addDateInput = () => setDates([...dates, ""]);
  const removeDateInput = (index) => setDates(dates.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access");
      const res = await fetch("http://127.0.0.1:8000/api/adminpanel/pickupdates/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ city: selectedCity, dates }),
      });
      if (!res.ok) throw new Error("Failed to save dates");
      alert("Pickup dates added successfully");
      setDates([""]);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading cities...</p>;

  return (
    <Container className="mt-4">
      <h2>Allocate Pickup Dates</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Select City</Form.Label>
          <Form.Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} required>
            <option value="">-- Select City --</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Form.Select>
        </Form.Group>

        {dates.map((d, i) => (
          <Form.Group key={i} className="mb-2 d-flex">
            <Form.Control
              type="date"
              value={d}
              onChange={(e) => handleDateChange(i, e.target.value)}
              required
            />
            <Button variant="danger" onClick={() => removeDateInput(i)} className="ms-2">Remove</Button>
          </Form.Group>
        ))}

        <Button variant="secondary" onClick={addDateInput}>Add Another Date</Button>
        <br /><br />
        <Button type="submit">Save Pickup Dates</Button>
      </Form>
    </Container>
  );
};

export default AdminPickupDates;
