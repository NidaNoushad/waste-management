
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const isSunday = (date) => dayjs(date).day() === 0;
const CUTOFF_HOUR = 16;




const generatePickupDates = (startDate, frequency, duration) => {
  let dates = [];
  let now = dayjs();
  let start = dayjs(startDate);

  // === DAILY ===
  if (frequency === "daily") {
    let count = 0;
    let day = start;

    // cutoff check → if today after cutoff, shift to tomorrow
    if (day.isSame(now, "day") && now.hour() >= CUTOFF_HOUR) {
      day = day.add(1, "day");
    }

    while (count < duration) {
      if (!isSunday(day)) {
        dates.push(day.format("YYYY-MM-DD"));
        count++;
      }
      day = day.add(1, "day");
    }
  }

  // === WEEKLY ===
  if (frequency === "weekly") {
    let day = start;

    if (day.isSame(now, "day") && now.hour() >= CUTOFF_HOUR) {
      day = day.add(1, "week"); // after cutoff → next week
    }

    for (let i = 0; i < duration; i++) {
      if (!isSunday(day)) {
        dates.push(day.format("YYYY-MM-DD"));
      }
      day = day.add(1, "week");
    }
  }

  // === MONTHLY ===
  if (frequency === "monthly") {
    let day = start;

    // cutoff → if booked after cutoff, first pickup = tomorrow
    if (day.isSame(now, "day") && now.hour() >= CUTOFF_HOUR) {
      day = day.add(1, "day");
    }

    for (let i = 0; i < duration; i++) {
      if (isSunday(day)) {
        day = day.add(1, "day"); // skip Sunday
      }
      dates.push(day.format("YYYY-MM-DD"));
      day = day.add(1, "month"); // repeat monthly from the first pickup
    }
  }

  return dates;
};




const PaymentPage = ({ data, onBack, onConfirm, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [pickupDates, setPickupDates] = useState([]);
  
  const { 
    base_price, waste_type, name, email, phone, address, city, zipcode, 
    date, weight, additional_charges, category, frequency, duration, 
    urgency, gstAmount, final_amount 
  } = data;
  
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    if (["daily", "weekly", "monthly"].includes(frequency)) {
      const dates = generatePickupDates(
        date || new Date(),
        frequency,
        duration || 1
      );
      setPickupDates(dates);
    } else if (frequency === "onlyOnce") {
      if (urgency === "urgent") {
        setPickupDates([dayjs().add(1, "day").format("YYYY-MM-DD")]);
      } else if (urgency === "notUrgent" && date) {
        setPickupDates([dayjs(date || dayjs().format("YYYY-MM-DD")).format("YYYY-MM-DD")]);
      }
    }
  }, [date, frequency, urgency, duration]);


  const handleConfirm = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    const token = localStorage.getItem("accessToken");
    let userId = null;
    let userEmail = null;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        userId = decoded.user_id || decoded.id || null;
        userEmail = decoded.email || data.email || "";
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }

    if (!userId) {
      alert("User not authenticated properly.");
      setLoading(false);
      return;
    }

    if (!userEmail) {
      alert("No email found for this order. Please update your profile or enter it.");
      setLoading(false);
      return;
    }

    // Cash on Pickup
    if (paymentMethod === "Cash on Pickup") {
      try {
        const payload = {
          ...data,
          economy_weight_option: data.economyWeightOption, 
          final_amount: Number(final_amount) || 0,
          base_price: Number(base_price) || 0,
          additional_charges: Number(additional_charges) || 0,
          gstAmount: Number(gstAmount) || 0,
          email: userEmail,
          user: userId,
          payment_method: paymentMethod,
          zipcode: zipcode,
          pickup_dates: pickupDates.length > 0 ? pickupDates : [dayjs().format("YYYY-MM-DD")]
        };

        console.log("Cash on Pickup - Payload being sent:", payload);
        
        // const response = await axiosInstance.post("http://localhost:8000/api/waste-requests/", 
        const response = await axiosInstance.post("waste-requests/", 
        payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Order saved:", response.data);
        const orderId = response.data.id;

        const confirmResponse = await axiosInstance.post(
          // `http://localhost:8000/api/waste-requests/${orderId}/confirm_payment/`,
          `waste-requests/${orderId}/confirm_payment/`,
          { payment_method: paymentMethod },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Payment confirmed:", confirmResponse.data);
        setSuccessMsg("Order confirmed! A confirmation email has been sent.");
        onSuccess(response.data);
        navigate(`/invoice/${orderId}`);
        
      } catch (error) {
        if (error.response) {
          console.error("Backend error response:", error.response.data);
          setErrorMsg("Failed to save order: " + JSON.stringify(error.response.data));
        } else {
          setErrorMsg("Failed to save order. Please try again.");
          console.error("Error saving order:", error);
        }
      } finally {
        setLoading(false);
      }
    } 
    // UPI/Card Payment
    else if (paymentMethod === "UPI" || paymentMethod === "Card") {
      const amountToSend = Number(final_amount);
      if (!amountToSend || isNaN(amountToSend)) {
        setErrorMsg("Invalid payment amount.");
        setLoading(false);
        return;
      }

      try {
        // Create Razorpay order
        const orderRes = await axiosInstance.post(
          // "http://localhost:8000/api/create-razorpay-order/",
          "create-razorpay-order/",
          { amount: amountToSend },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const razorpayOrder = orderRes.data;
        console.log("Razorpay order created:", razorpayOrder);

        const options = {
          key: "rzp_test_RAONx9ceY2LHYG",
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "TrashGo",
          description: "Payment for Waste Pickup",
          order_id: razorpayOrder.id,
          prefill: { 
            name: name || "User", 
            email: email || userEmail, 
            contact: phone || "9999999999" 
          },
          method: {
            card: paymentMethod === "Card" ? true : false,
            upi: paymentMethod === "UPI" ? true : false,
          },
          handler: async (razorpayResponse) => {
            console.log("Payment successful:", razorpayResponse);
            
            try {
              // Verify payment
              const verificationRes = await axiosInstance.post(
                // "http://localhost:8000/api/verify-payment/",
                "verify-payment/",
                {
                  razorpay_order_id: razorpayResponse.razorpay_order_id,
                  razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                  razorpay_signature: razorpayResponse.razorpay_signature,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verificationRes.data.status !== "success") {
                setErrorMsg("Payment verification failed.");
                setLoading(false);
                return;
              }

              // Create order in backend
              const payload = {
                ...data,
                economy_weight_option: data.economyWeightOption,
                final_amount: Number(final_amount) || 0,
                base_price: Number(base_price) || 0,
                additional_charges: Number(additional_charges) || 0,
                gstAmount: Number(gstAmount) || 0,
                email: userEmail,
                user: userId,
                payment_method: paymentMethod,
                payment_status: "Paid",
                status: "Confirmed", 
                
                transaction_id: razorpayResponse.razorpay_payment_id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                zipcode: zipcode,
                pickup_dates: pickupDates.length > 0 ? pickupDates : [dayjs().format("YYYY-MM-DD")]
              };
              console.log("UPI/Card - Payload being sent:", payload);
              const saveRes = await axiosInstance.post(
                // "http://localhost:8000/api/waste-requests/",
                "waste-requests/", 
                payload, 
                { headers: { Authorization: `Bearer ${token}` } }
              );

              console.log("Order saved:", saveRes.data);
    const orderId = saveRes.data.id;

// CHANGE
try {
  const confirmResponse = await axiosInstance.post(
    // `http://localhost:8000/api/waste-requests/${orderId}/confirm_payment/`,
    `waste-requests/${orderId}/confirm_payment/`,
    { 
      payment_method: paymentMethod,
      transaction_id: razorpayResponse.razorpay_payment_id // Send transaction ID
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  console.log("Payment confirmed and email sent:", confirmResponse.data);
} catch (emailError) {
  console.error("Email sending failed:", emailError);
  
}




              setSuccessMsg("Payment successful! Order confirmed.");
              setLoading(false);
              onSuccess(saveRes.data);
    // Redirect to invoice
              navigate(`/invoice/${saveRes.data.id}`);
            } catch (err) {
              console.error("Payment verification/order save failed:", err);
              if (err.response) {
                console.error("Backend said:", err.response.data);
                alert("Backend error: " + JSON.stringify(err.response.data));
              }
              setErrorMsg("Payment succeeded but order processing failed. Contact support.");
              setLoading(false);
            }
          },
          modal: { ondismiss: () => setLoading(false) },
          theme: { color: "#3399cc" },
        };
        const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      setErrorMsg(`Payment failed: ${response.error.description}`);
      setLoading(false);
    });
    rzp.open();
  } catch (error) {
    console.error("Payment initialization error:", error);
    setErrorMsg("Payment initialization failed. Please try again.");
    setLoading(false);
  }
}
};
  

  return (
    <Container fluid className="p-3">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card
            className="shadow-sm p-4"
            data-aos="fade-up"
            style={{ borderRadius: "10px", border: "none", backgroundColor: "#fff" }}
          >
            <h3 className="mb-4 text-center">Order Summary</h3>

            {successMsg && <div className="alert alert-success">{successMsg}</div>}
            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

            <div data-aos="fade-right">
              {/* <h5>Order Summary</h5> */}
              <p><strong>Waste Type:</strong> {waste_type}</p>
              <p><strong>Waste Category:</strong> {category}</p>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>Address:</strong> {address}</p>
              <p><strong>Zip Code:</strong> {zipcode}</p>
              {!["daily", "weekly", "monthly"].includes(frequency) && (
                <p><strong>City:</strong> {city}</p>
              )}
              
              {urgency && (
                <p>
                  <strong>Urgency:</strong> {urgency} <br />
                  <strong>Date:</strong> {dayjs(date).format("YYYY-MM-DD")}
                </p>
              )}
              
              {["daily", "weekly", "monthly"].includes(frequency) && (
                <div>
                  <strong>Pickup Dates:</strong>
                  <ul>
                    {pickupDates.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p><strong>Frequency:</strong> {frequency ? frequency.charAt(0).toUpperCase() + frequency.slice(1) : "N/A"}</p>
              <p><strong>Urgency:</strong> {urgency ? (urgency === "urgent" ? "Urgent" : "Not Urgent") : "N/A"}</p>
              
              {["daily", "weekly", "monthly"].includes(frequency) && duration && (
                <p>
                  <strong>Duration:</strong> {duration} {frequency === "daily" ? "day(s)" : frequency === "weekly" ? "week(s)" : "month(s)"}
                </p>
              )}
              
              <p><strong>Weight:</strong> {weight} kg</p>
              <p><strong>Price:</strong> ₹{base_price}</p> 
              <p><strong>Additional Charge:</strong> ₹{additional_charges}</p>
              <p><strong>GST (18%):</strong> ₹{gstAmount}</p>
              <hr />
              <p><strong>Final Amount:</strong> ₹{final_amount}</p>
              <hr />
            </div>

            <Form data-aos="fade-left">
              <h5>Select Payment Method</h5>
              <Form.Check
                type="radio"
                label="Credit / Debit Card"
                name="paymentMethod"
                value="Card"
                checked={paymentMethod === "Card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="UPI"
                name="paymentMethod"
                value="UPI"
                checked={paymentMethod === "UPI"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Cash on Pickup"
                name="paymentMethod"
                value="Cash on Pickup"
                checked={paymentMethod === "Cash on Pickup"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </Form>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={onBack}>
                ← Back
              </Button>
              <Button variant="success" onClick={handleConfirm} disabled={loading}>
                {loading ? "Processing..." : "Confirm Payment"}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;
