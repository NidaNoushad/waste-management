import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import axios from 'axios';
import dayjs from "dayjs";
import axiosInstance from "../utils/axiosInstance";


const wasteCategories = [
  "Plastic",
  "Organic",
  "Metal",
  "Glass",
  "Electronic",
  "Paper",
  "All",
];

const PricingSelectionForm = ({ onConfirm, onBack, defaultValues = {} }) => {
  const [duration, setDuration] = useState(defaultValues.duration || ""); // default 1
  const [waste_type, setwaste_type] = useState(defaultValues.waste_type || ""); // "bulk" or "economy"
  const [weightError, setWeightError] = useState("");
  const [frequency, setFrequency] = useState(defaultValues.frequency || ""); // daily, weekly, monthly, onlyOnce
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [pickupDates, setPickupDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [urgency, setUrgency] = useState(defaultValues.urgency || ""); // urgent, notUrgent
  const [category, setCategory] = useState(defaultValues.category || "");
  const [economyWeightOption, setEconomyWeightOption] = useState(defaultValues.economyWeightOption || ""); // "below10" or "above10"
  const [weight, setWeight] = useState(defaultValues.weight || "");
  const [backendPrice, setBackendPrice] = useState(null);
  const [backendPriceData, setBackendPriceData] = useState(null);


  useEffect(() => {
    const fetchPrice = async () => {
      if (!waste_type) return; // skip if type not selected

      try {
        const accessToken = localStorage.getItem("accessToken"); // get JWT token

        // const res = await axiosInstance.post("http://localhost:8000/api/calculate-price/", {
        const res = await axiosInstance.post("calculate-price/", {
          waste_type,
          weight: parseFloat(weight) || null,
          economyWeightOption,
          frequency,
          duration: duration ? parseInt(duration) : null,
          urgency,

        },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }

        );

        setBackendPrice(res.data.final_amount); // show final amount
        setBackendPriceData(res.data);
      } catch (err) {
        console.error("Failed to fetch price", err);
        setBackendPrice(null);
        setBackendPriceData(null);
      }
    };

    fetchPrice();
  }, [waste_type, weight, economyWeightOption, frequency, duration, urgency]);



  useEffect(() => {
    // axiosInstance.get('http://localhost:8000/api/cities/')
    axiosInstance.get('cities/')
      .then(res => setCities(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch dates for Not Urgent
  useEffect(() => {
    if (urgency === "notUrgent" && selectedCity) {
      // axiosInstance.get(`http://localhost:8000/api/cities/${selectedCity}/pickupdates/`)
      axiosInstance.get(`cities/${selectedCity}/pickupdates/`)
        .then(res => setPickupDates(res.data))
        .catch(err => console.error(err));
    } else {
      setPickupDates([]);
    }
  }, [urgency, selectedCity]);
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

  const additional_charges = urgency === "urgent" ? 50 : 0;


  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();

    if (weightError) return;

    let cityName = "";

    if (urgency === "urgent") {
      // Urgent dropdown stores the city name directly
      cityName = selectedCity;
    } else {

      const cityObj = cities.find(c => String(c.id) === String(selectedCity));
      cityName = cityObj ? cityObj.name : "";
    }

    const pricingData = {
      plan: frequency,
      waste_type,
      category,
      weight:
        waste_type === "economy"
          ? (economyWeightOption === "below10"
            ? 10
            : parseFloat(weight) || 0)
          : parseFloat(weight) || 0,
      economyWeightOption,
      city: cityName,
      cityId: selectedCity,
      date: selectedDate || (urgency === "urgent" ? dayjs().add(1, "day").format("YYYY-MM-DD") : null),
      urgency,
      // additional_charges,
      frequency,
      duration: duration ? parseInt(duration) : null,
      base_price: backendPriceData?.base_price || 0,
      additional_charges: backendPriceData?.extra_charge || 0,
      gstAmount: backendPriceData?.gst_amount || 0,
      final_amount: backendPriceData?.final_amount || 0,
    };
    onConfirm(pricingData);
  };

  return (
    <Container className="my-4 p-4  shadow-sm bg-white" >
      <h3 className="mb-4" data-aos="fade-down" style={{ color: "#014421" }}>
        Waste Pricing & Selection
      </h3>

      {/* Waste Type */}
      <Form.Group as={Row} className="mb-3" data-aos="fade-right">
        <Form.Label as="legend" column sm={3}>
          Waste Type:
        </Form.Label>
        <Col sm={9}>
          <Form.Check
            inline
            label="Bulk"
            type="checkbox"
            id="bulk-checkbox"
            checked={waste_type === "bulk"}
            onChange={() => {
              setwaste_type(waste_type === "bulk" ? "" : "bulk");
              setEconomyWeightOption("");
              setWeight("");
            }}
          />
          <Form.Check
            inline
            label="Economy"
            type="checkbox"
            id="economy-checkbox"
            checked={waste_type === "economy"}
            onChange={() => {
              setwaste_type(waste_type === "economy" ? "" : "economy");
              setEconomyWeightOption("");
              setWeight("");
            }}
          />
        </Col>
      </Form.Group>

      {/* Frequency */}
      <Form.Group as={Row} className="mb-3" data-aos="fade-left">
        <Form.Label as="legend" column sm={3}>
          Frequency:
        </Form.Label>
        <Col sm={9}>
          {["daily", "weekly", "monthly", "onlyOnce"].map((freq) => (
            <Form.Check
              inline
              key={freq}
              label={freq === "onlyOnce" ? "Only Once" : freq.charAt(0).toUpperCase() + freq.slice(1)}
              type="radio"
              name="frequencyRadios"
              id={`freq-${freq}`}
              checked={frequency === freq}
              onChange={() => {
                setFrequency(freq);
                setUrgency("");
                setSelectedCity("");
                setSelectedDate("");
              }}
            />
          ))}
        </Col>
      </Form.Group>

      {/* Duration input for daily, weekly, monthly */}
      {["daily", "weekly", "monthly"].includes(frequency) && (
        <Form.Group as={Row} className="mb-3" data-aos="fade-up">
          <Form.Label column sm={3}>
            {frequency === "daily" && "Number of days:"}
            {frequency === "weekly" && "Number of weeks:"}
            {frequency === "monthly" && "Number of months:"}
          </Form.Label>
          <Col sm={3}>
            <Form.Control
              type="number"
              min="1"
              max="365"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={`Enter number of ${frequency === "daily" ? "days" : frequency === "weekly" ? "weeks" : "months"}`}
            />
          </Col>
        </Form.Group>
      )}

      {frequency === "onlyOnce" && (
        <Form.Group as={Row} className="mb-3" data-aos="fade-up">
          <Form.Label as="legend" column sm={3}>
            Urgency:
          </Form.Label>
          <Col sm={9}>

            {/* Urgent */}
            <Form.Check
              inline
              label="Urgent"
              type="radio"
              name="urgencyRadios"
              id="urgent-radio"
              checked={urgency === "urgent"}
              onChange={() => {
                setUrgency("urgent");
                setSelectedCity("");
                setSelectedDate(dayjs().add(1, "day").format("YYYY-MM-DD")); // Tomorrow
              }}
            />

            {/* Not Urgent */}
            <Form.Check
              inline
              label="Not Urgent"
              type="radio"
              name="urgencyRadios"
              id="not-urgent-radio"
              checked={urgency === "notUrgent"}
              onChange={() => {
                setUrgency("notUrgent");
                setSelectedCity("");
                setSelectedDate("");
              }}
            />

            {/* Urgent Fields */}
            {urgency === "urgent" && (
              <>
                {/* City Dropdown */}
                <Form.Group as={Row} className="mt-2">
                  {/* <Form.Label column sm={3}>Select City:</Form.Label> */}
                  <Col sm={9}>
                    <Form.Select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    >
                      <option value="">-- Select City --</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Form.Group>

                {/* Read-only Date */}
                {selectedCity && (
                  <Form.Group as={Row} className="mt-2">
                    <Form.Label column sm={3}>Pickup Date:</Form.Label>
                    <Col sm={9}>
                      <Form.Control
                        plaintext
                        type="date"
                        value={dayjs().add(1, "day").format("YYYY-MM-DD")}
                        readOnly
                      />
                    </Col>
                  </Form.Group>
                )}
              </>
            )}

            {/* Not Urgent Fields */}
            {urgency === "notUrgent" && (
              <>
                {/* City Dropdown */}
                <Form.Group as={Row} className="mt-2">
                  <Col sm={9}>
                    <Form.Select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setSelectedDate("");
                      }}
                    >
                      <option value="">-- Select City --</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Form.Group>

                {/* Date Dropdown */}
                {pickupDates.length > 0 && (
                  <Form.Group as={Row} className="mt-2">
                    <Col sm={9}>
                      <Form.Select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      >
                        <option value="">-- Select Date --</option>
                        {pickupDates.map((d, index) => (
                          <option key={index} value={d.date}>
                            {d.date}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Form.Group>
                )}
              </>
            )}
          </Col>
        </Form.Group>
      )}

      {/* Waste Category */}
      <Form.Group as={Row} className="mb-3" data-aos="fade-up">
        <Form.Label column sm={3}>
          Waste Category:
        </Form.Label>
        <Col sm={9}>
          <Form.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Select Category --</option>
            {wasteCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Form.Group>

      {/* Economy specific options */}
      {waste_type === "economy" && (
        <Form.Group as={Row} className="mb-3" data-aos="fade-right">
          <Form.Label as="legend" column sm={3}>
            Weight Option:
          </Form.Label>
          <Col sm={9}>
            <Form.Check
              inline
              label="10 kg or below"
              type="checkbox"
              id="below10-checkbox"
              checked={economyWeightOption === "below10"}
              onChange={() => {
                if (economyWeightOption === "below10") {
                  setEconomyWeightOption("");
                  setWeight("");
                } else {
                  setEconomyWeightOption("below10");
                  setWeight("");
                }
              }}
            />
            <Form.Check
              inline
              label="Above 10 kg and below 25 kg"
              type="checkbox"
              id="above10-checkbox"
              checked={economyWeightOption === "above10"}
              onChange={() => {
                if (economyWeightOption === "above10") {
                  setEconomyWeightOption("");
                  setWeight("");
                } else {
                  setEconomyWeightOption("above10");
                  setWeight("");
                }
              }}
            />
          </Col>

          {/* Weight input for above 10 kg */}
          {economyWeightOption === "above10" && (
            <Col sm={{ span: 6, offset: 3 }} className="mt-3">
              <Form.Control
                type="number"
                min="10.01"
                max="24.99"
                placeholder="Enter weight in kg (10-25)"
                value={weight}
                onChange={(e) => {
                  const value = e.target.value;
                  setWeight(value);

                  if (value <= 10 || value >= 25) {
                    setWeightError("For Economy (above 10 kg), weight must be between 10 and 25 kg.");
                  } else {
                    setWeightError("");
                  }
                }}
              // onChange={(e) => setWeight(e.target.value)}
              />
              {weightError && (
                <small style={{ color: "red" }}>{weightError}</small>
              )}
            </Col>
          )}
        </Form.Group>
      )}



      {/* Bulk weight input */}
      {waste_type === "bulk" && (
        <Form.Group as={Row} className="mb-3" data-aos="fade-left">
          <Form.Label column sm={3}>
            Enter Weight (kg):
          </Form.Label>
          <Col sm={6}>
            <Form.Control
              type="number"
              min="0"
              placeholder="Enter weight in kg"
              value={weight}
              onChange={(e) => {
                const value = e.target.value;
                setWeight(value);

                if (value < 25) {
                  setWeightError("For Bulk, weight must be 25 kg or above.");
                } else {
                  setWeightError("");
                }
              }}
            // onChange={(e) => setWeight(e.target.value)}
            />
            {weightError && (
              <small style={{ color: "red" }}>{weightError}</small>
            )}
          </Col>
        </Form.Group>
      )}

      <Row className="mb-4" data-aos="fade-up">
        <Col sm={{ span: 6, offset: 3 }}>
          <h5>
            Estimated Price:{" "}
            <span className="text-success font-weight-bold">
              ₹ {backendPrice !== null ? backendPrice : "-"}
            </span>
          </h5>
        </Col>
      </Row>
      {/* Estimated Price */}
      {/* <Row className="mb-4" data-aos="fade-up">
        <Col sm={{ span: 6, offset: 3 }}>
          <h5>
            Estimated Price:{" "}
            <span className="text-success font-weight-bold" >
              ₹ {estimatedPrice || "0"}
            </span>
          </h5>
        </Col>
      </Row> */}
      {/* ...IMPORTANT */}

      {/* Submit button */}
      <Row>
        <Col sm={{ span: 6, offset: 3 }}>
          <Button
            style={{ backgroundColor: "#014421", cursor: "pointer" }}
            type="submit"
            onClick={handleSubmit}
            disabled={
              !waste_type ||
              !frequency ||
              (frequency === "onlyOnce" && urgency === "") ||
              (frequency === "onlyOnce" && urgency === "notUrgent" && (!selectedCity || !selectedDate)) ||
              !category ||
              (waste_type === "economy" && !economyWeightOption) ||
              (economyWeightOption === "above10" && (!weight || weight <= 10 || weight >= 25)) ||
              (waste_type === "bulk" && (!weight || weight <= 0))
            }
          >
            Confirm
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PricingSelectionForm;
