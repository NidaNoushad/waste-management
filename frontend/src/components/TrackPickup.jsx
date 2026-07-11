


import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ProgressBar, Table, Button, Form } from "react-bootstrap";
import AOS from "aos";
import axios from "axios";
import UpdateRequest from "./UpdateRequest"; // your modal component for updates
import "aos/dist/aos.css";
import "./TrackPickup.css"
import { useNavigate } from "react-router-dom";



const TrackPickup = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Fetch orders from backend
  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     try {
  //       const token = localStorage.getItem("accessToken");
  //       let url = `${process.env.REACT_APP_API_URL}waste-request-pickups/`;
  //       let allPickups = [];
  
  //       while (url) {
  //         const res = await axios.get(url, {
  //           headers: token ? { Authorization: `Bearer ${token}` } : {}
  //         });
  //         allPickups = allPickups.concat(res.data.results);
  //         url = res.data.next; // DRF pagination provides "next" URL
  //       }
  
  //       // Group by order_id
  //       const ordersMap = {};
  //       allPickups.forEach(pickup => {
  //         if (!ordersMap[pickup.order_id]) {
  //           ordersMap[pickup.order_id] = {
  //             id: pickup.id,
  //             orderId: pickup.order_id,
  //             address: pickup.address,
  //             category: pickup.category,
  //             subcategory: pickup.waste_type,
  //             quantity: `${pickup.weight || 0} Kg`,
  //             paymentId: pickup.transaction_id || "-",
  //             pickups: []
  //           };
  //         }
  //         ordersMap[pickup.order_id].pickups.push(pickup);
  //       });
  
  //       const formattedOrders = Object.values(ordersMap);
  //       setOrdersData(formattedOrders);
  //       if (formattedOrders.length) setSelectedOrder(formattedOrders[0]);
  
  //     } catch (err) {
  //       console.error("Fetch failed:", err);
  //     }
  //   };
  
  //   fetchOrders();
  // }, []);
  
  // const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      let url = `${process.env.REACT_APP_API_URL}waste-request-pickups/`;
      let allPickups = [];

      while (url) {
        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        allPickups = allPickups.concat(res.data.results);
        url = res.data.next;
      }

      const ordersMap = {};
      allPickups.forEach(pickup => {
        if (!ordersMap[pickup.order_id]) {
          ordersMap[pickup.order_id] = {
            id: pickup.id,
            orderId: pickup.order_id,
            address: pickup.address,
            category: pickup.category,
            subcategory: pickup.waste_type,
            // quantity: `${pickup.weight || 0} Kg`,
            paymentMethod: pickup.payment_method,
            paymentId: pickup.payment_method === "Cash on Pickup" ? "-" : (pickup.transaction_id || "-"),
           
            quantity: pickup.weight 

  ? `${pickup.weight} Kg` 
  : pickup.economy_weight_option || "0",
            // paymentId: pickup.transaction_id || "-",
            pickups: []
          };
        }
        ordersMap[pickup.order_id].pickups.push({
          ...pickup,
          payment_method: pickup.payment_method,  // ✅ ensure pickup-level always has this
          transaction_id: pickup.transaction_id
        });
      });
      const formattedOrders = Object.values(ordersMap).filter(order =>
        order.pickups.some(pickup => pickup.status !== "Cancelled")
      );
      // const formattedOrders = Object.values(ordersMap);
      setOrdersData(formattedOrders);
      if (formattedOrders.length) setSelectedOrder(formattedOrders[0]);
      setLoading(false);

    } catch (err) {
      console.error("Fetch failed:", err);
      setLoading(false);
    }
  };

  fetchAllOrders();
}, []);


  // Nearest Pickup Logic
  // const getNearestPickup = (pickups) => {
  //   return pickups.find(p => p.status === "On the Way") ||
  //          pickups.find(p => p.status === "Scheduled") ||
  //          pickups.find(p => p.status === "Completed");
  // };
  // const nearestPickup = selectedOrder 
  //   ? getNearestPickup(selectedOrder.pickups) 
  //   : null;
  // Nearest Pickup Logic
const progressStatuses = ["Pending","Assigned", "On the Way", "Completed"];
const navigate = useNavigate();

const nearestPickup = selectedOrder 
  ? selectedOrder.pickups.find(p => progressStatuses.includes(p.status))
  : null;

  const statusProgress = {
    "Pending": 30,
    "Assigned": 50,
    "On the Way": 75,
    "Completed": 100,
    "Cancelled": 0
  };

  // Update handler for modal
  const handleUpdate = async (updatedFields) => {
    if (!selectedPickup) return;

    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        ...updatedFields,
        pickup_date: selectedPickup.pickup_date
      };

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}user-update-request/${selectedPickup.id}/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state with new values
      setOrdersData(prevOrders => prevOrders.map(order => {
        if (order.orderId !== selectedOrder.orderId) return order;
        // const updatedPickups = order.pickups.map(p =>
        //   p.id === selectedPickup.id
        //     ? { ...p, ...res.data } 
        //     : p
        // );

        // Also update main order fields if changed
        return {
         
          ...order,
          pickups: order.pickups.map(p =>
            p.id === selectedPickup.id ? { ...p, ...res.data } : p
          ),
          address: res.data.address || order.address,
          quantity: res.data.weight 
            ? `${res.data.weight} Kg` 
            : res.data.economy_weight_option || order.quantity,
          category: res.data.category || order.category,
          subcategory: res.data.waste_type || order.subcategory
        
        };
      }));
      // setSelectedPickup(prev => ({ ...prev, ...res.data }));
      setSelectedPickup(prev => ({
        ...prev,
        ...res.data,
        address: res.data.address || prev.address,
        weight: res.data.weight ?? prev.weight,
        economy_weight_option: res.data.economy_weight_option || prev.economy_weight_option,
        category: res.data.category || prev.category,
        waste_type: res.data.waste_type || prev.waste_type,
      }));

      setShowUpdateModal(false);
      setSelectedPickup(null);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update request. Please try again.");
    }
  };

  const handleCancel = async (pickup) => {
    if (!window.confirm(`Cancel pickup on ${pickup.pickup_date}?`)) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `${process.env.REACT_APP_API_URL}user-cancel-request/${pickup.id}/`,
        { pickup_date: pickup.pickup_date },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrdersData(prevOrders => prevOrders.map(order => {
        if (order.orderId !== selectedOrder.orderId) return order;
        const updatedPickups = order.pickups.map(p =>
          p.pickup_date === pickup.pickup_date ? { ...p, status: "Cancelled" } : p
        );
        return { ...order, pickups: updatedPickups };
      }));

      alert(`Pickup on ${pickup.pickup_date} cancelled successfully.`);
    } catch (err) {
      console.error(err);
      alert("Cancel failed. Try again.");
    }
  };

  return (
    <Container className="my-5">
  {selectedPickup && (
    <UpdateRequest
      show={showUpdateModal}
      initialData={selectedPickup}
      onClose={() => setShowUpdateModal(false)}
      onUpdate={handleUpdate}
    />
  )}

  {/* Order Selector */}
  <Row className="mb-4" data-aos="fade-down">
    <Col md={8} className="mx-auto">
      <Card className="shadow-lg rounded-4 p-4 text-center">
        <h4 className="mb-3 fw-bold">Select Your Order</h4>

        {/* Scrollable Dropdown */}
       
        <div className="scrollable-select">
        {loading ? (
  <p className="text-center">Loading orders...</p>):(
          <Form.Select
            size="lg"
            value={selectedOrder?.orderId || ""}
            onChange={e => {
              const selectedId = e.target.value;
              const order = ordersData.find(o => String(o.orderId) === selectedId);
              setSelectedOrder(order);
              setSelectedPickup(order.pickups[0] || null);
            }}
          >
            {ordersData.map(order => (
              <option key={order.orderId} value={order.orderId}>
                {order.orderId}
              </option>
            ))}
          </Form.Select>)}
        </div>
      </Card>
    </Col>
  </Row>

  {/* Nearest Pickup */}
  {nearestPickup && (
    <>
      <Row className="mb-4" data-aos="fade-up">
        <Col>
          <h4 className="text-center mb-3">Nearest Pickup Status</h4>
          <ProgressBar
            now={statusProgress[nearestPickup.status] || 25}
            label={nearestPickup.status}
            striped
            animated
          />
          <p className="text-center mt-2">
            <strong>Date:</strong> {" "}
  {new Date(nearestPickup.pickup_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })}
            {/* {nearestPickup.pickup_date} */}
          </p>
        </Col>
      </Row>

      {/* Request & Pickup Info */}
      <Row className="mb-4" data-aos="fade-left">
        <Col>
          <Card className="shadow p-3 rounded-4">
            <h5>Request & Pickup Information</h5>
            {selectedPickup ? (
  <>
    <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
    <p><strong>Pickup Date:</strong> {selectedPickup.pickup_date}</p>
    <p><strong>Status:</strong> {selectedPickup.status}</p>
    <p><strong>Waste Type:</strong> {selectedPickup.waste_type}</p>
    <p><strong>Category:</strong> {selectedPickup.category}</p>
    {/* <p><strong>Address:</strong> {selectedPickup.address}</p> */}
    <p>
      <strong>Address:</strong> {selectedPickup.address }
    </p>
    <p>
  <strong>Quantity:</strong> {selectedPickup.weight 
    ? `${selectedPickup.weight} Kg` 
    : selectedPickup.economy_weight_option || "0"}
</p>
    {/* <p><strong>Quantity:</strong> {selectedPickup.weight || 0} Kg</p> */}
    <p><strong>Payment Method:</strong> {selectedPickup.payment_method}</p>
    {selectedPickup.payment_method !== "Cash on Pickup" && (
  <p><strong>Payment ID:</strong> {selectedPickup.transaction_id || "-"}</p>
)}

    {/* <p><strong>Payment ID:</strong> {selectedOrder.paymentId}</p> */}
  </>
) : (
  <>
    <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
    <p><strong>Address:</strong> {selectedOrder.address}</p>
    <p><strong>Category:</strong> {selectedOrder.category}</p>
    <p><strong>Subcategory:</strong> {selectedOrder.subcategory}</p>
    <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
    {selectedOrder.paymentMethod !== "Cash on Pickup" && (
  <p><strong>Payment ID:</strong> {selectedOrder.paymentId}</p>
)}
    {/* <p><strong>Payment ID:</strong> {selectedOrder.paymentId}</p> */}
  </>
)}

          </Card>
        </Col>
      </Row>

      {/* All Pickups */}
      <Row className="mb-4" data-aos="fade-up">
        <Col>
          <Card className="shadow p-3 rounded-4">
            <h5>All Pickup Dates</h5>
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Waste Type</th>
                  <th>Category</th>
                  <th>Address</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.pickups.map(p => (
                  <tr key={p.pickup_date}>
                    <td>{p.pickup_date}</td>
                    <td>{p.status}</td>
                    <td>{p.waste_type}</td>
                    <td>{p.category}</td>
                    <td>{p.address}</td>
                    <td>
                    {p.status === "Complete" && (
          <Button
            size="sm"
            variant="outline-success"
            onClick={() =>
              navigate("/feedback", { state: { highlightOrderId: p.order_id, highlightPickupDate: p.pickup_date } })
            }
          >
            Feedback
          </Button>
        )}
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </>
  )}
</Container>

  
  );
};

export default TrackPickup;



