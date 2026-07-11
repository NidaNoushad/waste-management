

// File: ServiceBulk.jsx
import React, {useState, useEffect } from 'react';

import './ServiceBulk.css';
import { Link } from "react-router-dom";
import AOS from "aos";
import Footer from './Footer';
import Header from './Header';
import { useLocation } from "react-router-dom";
import MainNavbar from './MainNavbar';

export default function ServiceBulk() {
  const location = useLocation();
  const [weight, setWeight] = useState("");
  const [estimate, setEstimate] = useState(null);



  useEffect(() => {
    AOS.init({ duration: 1000 });

    if (location.state?.scrollToPricing) {
      const section = document.getElementById("pricing");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  // Same calculation logic as backend
  const calculatePickupPrice = (wasteType, weight, economyWeightOption = null, frequency = "onlyOnce", duration = 1, urgency = "notUrgent") => {
    let base_price = 0;

    if (wasteType === "economy") {
      if (economyWeightOption === "below10") {
        base_price = 60;
      } else if (economyWeightOption === "above10" && weight) {
        const w = parseFloat(weight);
        if (w > 10 && w < 25) {
          base_price = w * 20;
        }
      }
    } else if (wasteType === "bulk" && weight) {
      base_price = parseFloat(weight) * 15;
    }

    // Apply duration
    let base_price_with_duration =
      ["daily", "weekly", "monthly"].includes(frequency)
        ? base_price * duration
        : base_price;

    // Urgency charges
    const extra_charge = urgency === "urgent" ? 50 : 0;
    base_price_with_duration += extra_charge;

    // GST
    const gst_amount = +(base_price_with_duration * 0.18).toFixed(2);
    const final_amount = +(base_price_with_duration + gst_amount).toFixed(2);

    return { base_price, extra_charge, gst_amount, final_amount };
  };

  const handleEstimate = () => {
    if (!weight || isNaN(weight)) {
      alert("Please enter a valid weight!");
      return;
    }

    // For now, assume bulk waste type
    const result = calculatePickupPrice("bulk", weight);

    setEstimate(result);
  };

  useEffect(() => {
    const mobToggle = () => {
      const btn = document.getElementById('mobileMenuBtn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const nav = document.getElementById('mainNav');
        nav.classList.toggle('show-mobile');
      });
    };
    mobToggle();
  }, []);

  return (
    <div className="bulk-root">
      <Header/>
    <MainNavbar/>
    <section 
    className="ewaste-hero"
    style={{
      background: `url("/assets/bulk1.jpg") center/cover no-repeat`,
    }}>
      <div className="overlay"></div>
      <div className="content" data-aos="fade-up">
        <h1 className="hero-title">Bulk Waste Collection</h1>
        <p className="hero-subtitle">Our Services</p>
        <p className="breadcrumb">
      <Link to="/" className="breadcrumb-link">Home</Link> &gt;{" "}
      <Link to="/serviceslist" className="breadcrumb-link">Our Services</Link>&gt;{" "}
      <Link to="/service/bulk" className="breadcrumb-link">Bulk Waste Collection</Link>
    </p>
      </div>
      </section>

      {/* HERO */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-5 mb-3">Bulk Waste Collection — Hassle-free pickups for loads above 25 kg</h1>
              <p className="lead text-muted mb-4">Doorstep collection, safe transport and responsible disposal. Schedule online in 2 minutes.</p>

              <div className="d-flex gap-2 flex-wrap">
                <Link to="/login" className="btn btn-primary btn-lg">Schedule a Pickup</Link>
                <Link to="/serviceslist" className="btn btn-outline-secondary btn-lg">See Services</Link>
              </div>

              <ul className="list-unstyled mt-4 hero-stats">
                <li><strong>✓</strong> Trained crews for heavy lifts</li>
                <li><strong>✓</strong> Eco-friendly recycling</li>
                <li><strong>✓</strong> Transparent pricing</li>
              </ul>
            </div>

            <div className="col-lg-6 text-center mt-4 mt-lg-0">
              <div className="hero-card shadow-sm p-4">
                <img src="/assets/bulk2.jpg" alt="bulk waste" className="img-fluid rounded" />
                <div className="mt-3 text-start">
                  <h5 className="mb-1">Quick Quote</h5>
                  <p className="small text-muted mb-2">Estimate price instantly based on weight & waste type.</p>
                  <div className="d-flex gap-2">
                    <input className="form-control" placeholder="Enter weight (kg)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)} />
                    <button className="btn btn-success" onClick={handleEstimate}>Estimate</button>
                  </div>
                  {estimate && (
            <div className="mt-3">
              <p className="mb-1">Base Price: ₹{estimate.base_price}</p>
              {estimate.extra_charge > 0 && (
                <p className="mb-1">Urgency Charge: ₹{estimate.extra_charge}</p>
              )}
              <p className="mb-1">GST (18%): ₹{estimate.gst_amount}</p>
              <h6 className="fw-bold">Final Amount: ₹{estimate.final_amount}</h6>
            </div>
          )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-4">
            <h3>Why choose our Bulk Collection?</h3>
            <p className="text-muted">Designed for large loads — safe, fast and responsible.</p>
          </div>

          <div className="row g-4">
            <Feature title="Professional Crews" text="Trained for lifting, dismantling and loading large items safely." />
            <Feature title="Proper Vehicles" text="Special vehicles with loading equipment and covered transport."  />
            <Feature title="Responsible Disposal" text="We sort, recycle and dispose according to local regulations."  />
            <Feature title="Flexible Slots" text="Choose a date that fits your schedule. Weekend pickups available."  />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-5">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-md-6">
              <h3>What we collect</h3>
              <p className="text-muted">From old sofas to construction debris — we handle it all.</p>
              <ul className="list-unstyled">
                <li className="mb-2">• Furniture & fixtures (beds, sofas, wardrobes)</li>
                <li className="mb-2">• Appliances (fridges, washing machines)</li>
                <li className="mb-2">• Construction & renovation debris</li>
                <li className="mb-2">• Office clear-outs & bulk garden waste</li>
              </ul>
            </div>
            <div className="col-md-6 text-center">
              <img src="/assets/bulk3.jpg" alt="services" className="img-fluid rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* pricing */}
       <section id="pricing" className="py-5 bg-light">
      <div className="container">
        <div className="text-center mb-4">
          <h3>Transparent Pricing</h3>
          <p >
            Simple price bands.Prices vary by weight.
          </p>
        </div>

        <div className="row g-4 justify-content-center" style={{height:"27rem"}}>
          {/* Economy Small */}
          <div className="col-md-4">
            <div className="custom-card h-100">
              <div className="custom-card-inner">
                <h5 className="card-title">Economy – Small Loads</h5>
                <p className="h3">₹ 60</p>
                <p className="text-muted">Up to 10 kg</p>
                <ul className="list-unstyled mt-3 mb-4 text-start">
                  <li>• Flat price — best for households</li>
                  <li>• Doorstep pickup</li>
                  <li>• Standard scheduling</li>
                </ul>
        
              </div>
              <div className="custom-card-glow"></div>
            </div>
          </div>

          {/* Economy Medium */}
          <div className="col-md-4">
            <div className="custom-card h-100">
              <div className="custom-card-inner">
                <h5 className="card-title">Economy – Medium Loads</h5>
                <p className="h3">₹ 20 × weight</p>
                <p className="text-muted">10 – 25 kg</p>
                <ul className="list-unstyled mt-3 mb-4 text-start">
                  <li>• Per kg rate for fair pricing</li>
                  <li>• Sorting & recycling included</li>
                  <li>• Faster scheduling options</li>
                </ul>
              
              </div>
              <div className="custom-card-glow"></div>
            </div>
          </div>

          {/* Bulk */}
          <div className="col-md-4">
            <div className="custom-card h-100">
              <div className="custom-card-inner">
                <h5 className="card-title">Bulk / Corporate</h5>
                <p className="h3">₹ 15 × weight</p>
                <p className="text-muted">Above 25 kg</p>
                <ul className="list-unstyled mt-3 mb-4 text-start">
                  <li>• Best for apartments, events, businesses</li>
                  <li>• Dedicated pickup crew & vehicle</li>
                  <li>• Regular & contract-based pickups</li>
                </ul>
             
              </div>
              <div className="custom-card-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
     
      
      {/* CTA / BOOK SECTION */}
      <section id="book" className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h3>Ready to book your bulk pickup?</h3>
              <p className="mb-0">Enter basic details and we’ll confirm a convenient time.</p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <Link to="/login" className="btn btn-light btn-lg">Book Now</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

function Feature({ title, text, icon }) {
  return (
    <div className="col-md-6 col-lg-3">
      <div className="feature-box p-3 h-100 bg-white shadow-sm rounded">
        <div className="d-flex align-items-start gap-3">
          <div className="feature-icon fs-3">{icon}</div>
          <div>
            <h5 className="mb-1">{title}</h5>
            <p className="text-muted mb-0 small">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


