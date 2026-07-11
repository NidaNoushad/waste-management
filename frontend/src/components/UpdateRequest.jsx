import React, { useState, useEffect } from "react";
import { Modal, Container, Row, Col, Form, Button } from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";

const UpdateRequest = ({ show, onClose, onUpdate, initialData, cities }) => {
  const [wasteType, setWasteType] = useState(initialData.waste_type || "");
  const [weight, setWeight] = useState(initialData.weight || "");
  const [economyWeightOption, setEconomyWeightOption] = useState(
    initialData.economyWeightOption || ""
  );
  const [category, setCategory] = useState(initialData.category || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [basePrice, setBasePrice] = useState(0);
  const [urgencyCharge, setUrgencyCharge] = useState(
    initialData.urgency === "urgent" ? 50 : 0
  );
  const [gst, setGst] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const isUrgent = initialData.urgency === "urgent";

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  useEffect(() => {
    setWasteType(initialData.waste_type || "");
    setWeight(initialData.weight || "");
    setCategory(initialData.category || "");
    setAddress(initialData.address || "");
    setEmail(initialData.email || "");
    setEconomyWeightOption(initialData.economyWeightOption || "");
    setUrgencyCharge(initialData.urgency === "urgent" ? 50 : 0);
  }, [initialData]);

  // Live pricing calculation
  useEffect(() => {
    let price = 0;

    if (wasteType === "economy") {
      if (economyWeightOption === "below10") {
        price = 60;
      } else if (economyWeightOption === "above10" && weight) {
        const w = parseFloat(weight);
        if (w > 10 && w < 25) price = w * 20;
      }
    } else if (wasteType === "bulk" && weight) {
      price = parseFloat(weight) * 15;
    }

    setBasePrice(price);

    const urgency = isUrgent ? 50 : 0;
    setUrgencyCharge(urgency);

    const gstAmount = (price + urgency) * 0.18;
    setGst(gstAmount);

    setTotalPrice(price + urgency + gstAmount);
  }, [wasteType, weight, economyWeightOption, isUrgent]);





  const handleUpdate = (e) => {
    e.preventDefault();
    const updatedWeight = economyWeightOption === "below10" ? 0 : weight;
    onUpdate({
      waste_type: wasteType,
      weight: updatedWeight,
      economyWeightOption,
      category,
      address,
      email,
      base_price: basePrice,
      final_amount: totalPrice,
      // urgencyCharge,
      gstAmount: gst,
      pickup_date: initialData.pickup_date, // important
   
     
  
    });
    onClose(); 
  };

  

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Pickup Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Form onSubmit={handleUpdate}>
            {/* Waste Type */}
            <Form.Group as={Row} className="mb-3" data-aos="fade-right">
              <Form.Label column sm={3}>Waste Type:</Form.Label>
              <Col sm={9}>
                <Form.Check
                  inline
                  label="Bulk"
                  type="checkbox"
                  checked={wasteType === "bulk"}
                  onChange={() => setWasteType(wasteType === "bulk" ? "" : "bulk")}
                />
                <Form.Check
                  inline
                  label="Economy"
                  type="checkbox"
                  checked={wasteType === "economy"}
                  onChange={() => setWasteType(wasteType === "economy" ? "" : "economy")}
                />
              </Col>
            </Form.Group>

            {wasteType === "economy" && (
              <Form.Group as={Row} className="mb-3" data-aos="fade-left">
                <Form.Label as="legend" column sm={3}>Weight Option:</Form.Label>
                <Col sm={9}>
                  <Form.Check
                    inline
                    label="10 kg or below"
                    type="checkbox"
                    checked={economyWeightOption === "below10"}
                    onChange={() => {
                      setEconomyWeightOption(economyWeightOption === "below10" ? "" : "below10");
                      setWeight("");
                    }}
                  />
                  <Form.Check
                    inline
                    label="Above 10 kg and below 25 kg"
                    type="checkbox"
                    checked={economyWeightOption === "above10"}
                    onChange={() => {
                      setEconomyWeightOption(economyWeightOption === "above10" ? "" : "above10");
                      setWeight("");
                    }}
                  />
                  {economyWeightOption === "above10" && (
                    <Form.Control
                      type="number"
                      min="11"
                      max="24"
                      placeholder="Enter weight in kg"
                      className="mt-2"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  )}
                </Col>
              </Form.Group>
            )}
              {wasteType === "bulk" && (
              <Form.Group as={Row} className="mb-3" data-aos="fade-left">
                <Form.Label column sm={3}>Weight (kg):</Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </Col>
              </Form.Group>
            )}

            {/* Weight */}
            {/* <Form.Group as={Row} className="mb-3" data-aos="fade-left">
              <Form.Label column sm={3}>Weight (kg):</Form.Label>
              <Col sm={6}>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </Col>
            </Form.Group> */}

            {/* Waste Category */}
            <Form.Group as={Row} className="mb-3" data-aos="fade-up">
              <Form.Label column sm={3}>Waste Category:</Form.Label>
              <Col sm={9}>
                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">-- Select Category --</option>
                  {["Plastic","Organic","Metal","Glass","Electronic","Paper","All"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>

            {/* Address */}
            <Form.Group as={Row} className="mb-3" data-aos="fade-right">
              <Form.Label column sm={3}>Address:</Form.Label>
              <Col sm={9}>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" data-aos="fade-right">
              <Form.Label column sm={3}>Email:</Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter email"
                  required
                />
              </Col>
            </Form.Group>
            {/* Urgency (read-only if previous request was urgent) */}
            {isUrgent && (
              <Form.Group as={Row} className="mb-3" data-aos="fade-left">
                <Form.Label column sm={3}>Urgency:</Form.Label>
                <Col sm={9}>
                  <Form.Control plaintext readOnly value="Urgent (+₹50)" />
                </Col>
              </Form.Group>
            )}

            {/* Pricing Display */}
            <Form.Group as={Row} className="mb-3" data-aos="fade-up">
              <Col sm={{ span: 6, offset: 3 }}>
                <div>Base Price: ₹ {basePrice.toFixed(2)}</div>
                {isUrgent && <div>Urgency Charge: ₹ {urgencyCharge.toFixed(2)}</div>}
                <div>GST (18%): ₹ {gst.toFixed(2)}</div>
                <h5>Total: ₹ {totalPrice.toFixed(2)}</h5>
              </Col>
            </Form.Group>


            <Form.Group as={Row} className="mb-4" data-aos="fade-left">
              <Form.Label column sm={3}>Pickup Date:</Form.Label>
              <Col sm={9}>
                <Form.Control plaintext readOnly defaultValue={initialData.pickup_date} />
              </Col>
            </Form.Group>

            <Row>
              <Col sm={6}>
                <Button variant="secondary" className="w-100" onClick={onClose}>Cancel</Button>
              </Col>
              <Col sm={6}>
                <Button type="submit" variant="success" className="w-100">Update</Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateRequest;
