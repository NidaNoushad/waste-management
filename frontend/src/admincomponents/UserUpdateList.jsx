import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Table, Spinner, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const UserUpdateList = () => {
  const { userId } = useParams();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
const itemsPerPage = 10;

const paginatedUpdates = updates.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${process.env.REACT_APP_API_URL}adminpanel/users/${userId}/user-updates/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUpdates(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load user updates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [userId]);

  const handleRefundStatusChange = async (updateId, newStatus) => {
    try {
      const token = localStorage.getItem("access");
      await fetch(`${process.env.REACT_APP_API_URL}user-update-request/${updateId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ partial_refund_status: newStatus }),
      });
      fetchUpdates(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Failed to update refund status");
    }
  };

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" variant="success" />
    </Container>
  );

  return (
    <Container className="mt-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
    <h3 className="mb-0">User Updates</h3>
    <Button
      variant="secondary"
      onClick={() => navigate(-1)} // goes back to UserDetail.jsx
    >
      Back
    </Button>
  </div>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Order ID</th>
            <th>Pickup Date</th>
            <th>Waste Type</th>
            <th>Weight</th>
            <th>Category</th>
            <th>Final Amount</th>
            <th>Partial Refund Amount</th>
            <th>Refund Status</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUpdates.map((u, index) => (
            <tr key={u.id}>
              <td>{index + 1}</td>
              <td>{u.order_id || "N/A"}</td>
              <td>{u.pickup_date}</td>
              <td>{u.waste_type}</td>
              <td>{u.weight}</td>
              <td>{u.category}</td>
              <td>{u.final_amount}</td>
              <td>{u.partial_refund_amount}</td>
             
              <Form.Select
  value={u.partial_refund_status || "Pending"} // show Pending if null
  onChange={(e) => handleRefundStatusChange(u.id, e.target.value)}
  disabled={u.payment_method === "Cash on Pickup"} 
>
  <option value="Pending">Pending</option>
  <option value="Refund_initiated">Refund Initiated</option>
  <option value="Refunded">Refunded</option>
  <option value="Failed">Failed</option>
</Form.Select>
              <td>
              <td>{u.payment_method || "N/A"}</td>
            
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-between mt-2">
  <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
  <span>Page {page}</span>
  <Button disabled={page * itemsPerPage >= updates.length} onClick={() => setPage(page + 1)}>Next</Button>
</div>

    </Container>
  );
};

export default UserUpdateList;
