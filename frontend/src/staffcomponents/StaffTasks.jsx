

import React, { useState, useEffect } from "react";
import { Table, Button, Dropdown, Nav, Modal } from "react-bootstrap";
import axios from "axios";

const StaffTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });
  
  // // ✅ Fetch tasks from backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (url = `${process.env.REACT_APP_API_URL}staff/pickups/`) => {
    try {
      const token = localStorage.getItem("access"); // 👈 staff login token
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = res.data.results || res.data;
  
      // save tasks
      setTasks(data);
  
      // save pagination info if using DRF pagination
      if (res.data.results) {
        setPagination({
          next: res.data.next,
          previous: res.data.previous,
          count: res.data.count,
        });
      } else {
        setPagination({ next: null, previous: null, count: data.length });
      }
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };
  

  // const fetchTasks = async () => {
  //   try {
  //     const token = localStorage.getItem("access"); // staff login token
  //     const res = await axios.get(`${process.env.REACT_APP_API_URL}staff/pickups/`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     // Filter out Cancelled tasks
  //     const activeTasks = (res.data.results || res.data).filter(
  //       task => task.status !== "Cancelled"
  //     );
  //     // handle pagination (.results) or plain list
  //     setTasks(res.data.results || res.data);
  //   } catch (err) {
  //     console.error("Error fetching tasks", err);
  //   }
  // };
  const filteredTasks =
  filter === "All"
    ? tasks
    : tasks.filter((task) => {
        // map backend Assigned → Pending
        const statusLabel = task.status === "Assigned" ? "Pending" : task.status;
        return statusLabel === filter;
      });
  //  const filteredTasks =
  //   filter === "All" ? tasks : tasks.filter((task) => task.status === filter);

  const handleView = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };
  
  const handleStatusChange = async (task, newStatus) => {
    try {
      console.log("Updating pickup", task.status_id, "to", newStatus);
      const token = localStorage.getItem("access");
  
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}staff/pickups/${task.status_id}/update-status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("API Response:", res.data);
  
      // update frontend state instantly
      setTasks((prev) =>
        prev.map((t) =>
          t.status_id === task.status_id ? { ...t, status: newStatus } : t
        )
      );


      if (res.data.partial_refund_amount) {
  setTasks((prev) =>
    prev.map((t) =>
      t.status_id === task.status_id
        ? { ...t, refund_amount: -res.data.partial_refund_amount } // negative to show as refund
        : t
    )
  );

  if (selectedTask && selectedTask.status_id === task.status_id) {
    setSelectedTask(prev => ({
      ...prev,
      refund_amount: -res.data.partial_refund_amount
    }));
  }
}
    } catch (err) {
      console.error("Error updating status", err);
    }
  };
  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.pickup_date === today && b.pickup_date !== today) return -1; // a is today → comes first
    if (b.pickup_date === today && a.pickup_date !== today) return 1;  // b is today → comes first
    return new Date(a.pickup_date) - new Date(b.pickup_date); // otherwise normal sorting
  });

  const statusLabels = {
    Assigned: "Pending",   // 👈 map backend "Assigned" to show "Pending"
    Pending: "Pending",
    "On the Way": "On the Way",
    Complete: "Complete",
    Cancelled: "Cancelled",
  };
  

  return (
    <>
    <div className="container mt-4">
      <h2 className="mb-4">📋 Taskboard</h2>

      {/* Filter Tabs */}
      <Nav
        variant="tabs"
        activeKey={filter}
        onSelect={(selectedKey) => setFilter(selectedKey)}
        className="mb-3"
      >
        <Nav.Item>
          <Nav.Link eventKey="All">All</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="Pending">Pending</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="On the Way">On the Way</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="Complete">Complete</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="Cancelled">Cancelled</Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Task Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Pickup Date</th>
            <th>Payment</th>
            <th>View Details</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task, index) => (
            <tr key={`${task.status_id}-${task.pickup_date}`}>
              <td>{index + 1}</td>
              <td>{task.order_id}</td>
              <td>{task.customer || "N/A"}</td>
              <td>{task.address}</td>
              <td>{task.pickup_date}</td>
              <td>
  {task.payment_method === "Card" || task.payment_method === "UPI" || task.is_paid ? (
    <span className="badge bg-success">Paid</span>
  ) : (
    <span className="badge bg-danger">Unpaid</span>
  )}
</td>
              {/* <td>
  {task.is_paid ? (
    <span className="badge bg-success">Paid</span>
  ) : (
    <span className="badge bg-danger">Unpaid</span>
  )}
</td> */}
              <td>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleView(task)}
                >
                  View
                </Button>
              </td>
              <td>
                {task.status === "Cancelled" ? (
                  <Button variant="secondary" size="sm" disabled>
                    Cancelled
                  </Button>
                ) : (
                  <Dropdown>
                    {/* <Dropdown.Toggle variant="secondary" size="sm">
                      {task.status}
                    </Dropdown.Toggle> */}
                    <Dropdown.Toggle variant="secondary"
                     size="sm"
                     disabled={
                      task.status === "Complete" &&
                      new Date(task.pickup_date) < new Date(today) // 👈 past date check
                    }
                     
                     >
  {statusLabels[task.status] || task.status}
</Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => handleStatusChange(task, "Complete")}
                      >
                        Complete
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleStatusChange(task, "On the Way")}
                      >
                        On the Way
                      </Dropdown.Item>
                       
                    </Dropdown.Menu>
                  </Dropdown>
                )}


              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              <p>
                <strong>Order ID:</strong> {selectedTask.order_id}
              </p>
              <p>
                <strong>Customer:</strong> {selectedTask.customer || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {selectedTask.address}
              </p>
              <p>
                <strong>Pickup Date:</strong> {selectedTask.pickup_date}
              </p>
              <hr />
              <p>
                <strong>Category:</strong> {selectedTask.category}
              </p>
              <p>
                <strong>Waste Type:</strong> {selectedTask.waste_type}
              </p>

              <p>
                <strong>Payment:</strong> {selectedTask.payment_method}
              </p>
            
              <p>
                <strong>Amount:</strong> ₹{selectedTask.per_date_amount}
              </p>
              {/* Show Refund if < 0 */}
{selectedTask.refund_amount < 0 && (
  <p className="text-danger">
    <strong>Refund:</strong> ₹{Math.abs(selectedTask.refund_amount)}
  </p>
)}

{/* Show Extra if > 0 */}
{selectedTask.extra_amount > 0 && (
  <p className="text-success">
    <strong>Extra Charge:</strong> ₹{selectedTask.extra_amount}
  </p>
)}
              {selectedTask && selectedTask.payment_method === "Cash on Pickup" && !selectedTask.is_paid && selectedTask.status !== "Cancelled" && (
  <Button
    variant="success"
    onClick={async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.put(
          `${process.env.REACT_APP_API_URL}staff/pickups/${selectedTask.status_id}/confirm-payment/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // update state
        setTasks((prev) =>
          prev.map((t) =>
            t.status_id === selectedTask.status_id
              ? { ...t, is_paid: true }
              : t
          )
        );
        setSelectedTask((prev) => ({ ...prev, is_paid: true }));
      } catch (err) {
        console.error("Error confirming payment", err);
      }
    }}
  >
    Mark Paid
  </Button>
)}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    {/* Pagination Controls */}
<div className="d-flex justify-content-between align-items-center mt-3">
  <Button
    variant="outline-primary"
    disabled={!pagination.previous}
    onClick={() => fetchTasks(pagination.previous)}
  >
    ⬅ Previous
  </Button>

  <span>
    Total: {pagination.count}
  </span>

  <Button
    variant="outline-primary"
    disabled={!pagination.next}
    onClick={() => fetchTasks(pagination.next)}
  >
    Next ➡
  </Button>
</div>
</>
  );
};

export default StaffTasks;



