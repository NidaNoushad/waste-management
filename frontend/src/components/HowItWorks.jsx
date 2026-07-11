

import React from "react";
import "aos/dist/aos.css";
import AOS from "aos";
import { useEffect } from "react";
import "./HowItWorks.css"; 

const HowItWorks = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <section className="how-it-works-section py-5">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Side Image */}
          <h6 className="section-title mb-3" data-aos="fade-left">
              How It Works
            </h6>
          <h2 className="section-title mb-3" data-aos="fade-left">
              A Simple Process For <br/>
              All Your Waste Management <br/>
               Needs
            </h2>
          <div className="col-lg-6 mb-4 mb-lg-0" data-aos="fade-right">
            <img
              src="/assets/processes.png" 
              alt="How it works"
              className="img-fluid rounded shadow"
            />
          </div>

          {/* Right Side Content */}
          <div className="col-lg-6">
           
            <p className="lead" data-aos="fade-left">
              Delivering smart waste solutions for homes, businesses & industries to keep communities clean and protect the environment every day.
            </p>

            {/* Steps */}
            <div className="row gy-4 mt-4">
              {/* Step 1 */}
              <div className="col-6" data-aos="fade-up">
                <div className="step-card">
                  <img src="/assets/phone.gif" alt="Pickup" className="icon mb-2" />
                  <h5 className="fw-bold">Request & Pickup</h5>
                  <p>Waste pickups are scheduled and collected from homes, businesses, or job sites.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="col-6" data-aos="fade-up" data-aos-delay="100">
                <div className="step-card">
                  <img src="/assets/truck.gif" alt="Transportation" className="icon mb-2" />
                  <h5 className="fw-bold">Transportation</h5>
                  <p>Waste is safely transported in specialized vehicles to treatment or disposal facilities.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="col-6" data-aos="fade-up" data-aos-delay="200">
                <div className="step-card">
                  <img src="/assets/waste.gif" alt="Sorting" className="icon mb-2" />
                  <h5 className="fw-bold">Sorting & Processing</h5>
                  <p>Waste is sorted into types and processed for recycling, composting, or disposal.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="col-6" data-aos="fade-up" data-aos-delay="300">
                <div className="step-card">
                  <img src="/assets/recycle.gif" alt="Recycling" className="icon mb-2" />
                  <h5 className="fw-bold">Disposal or Recycling</h5>
                  <p>Recyclables are reused, organics composted, and the rest disposed or incinerated safely.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
