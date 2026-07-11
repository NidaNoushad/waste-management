
import React from 'react';
import './MissionSection.css'; 

const MissionSection = () => {
  return (
    <section className="mission-section py-5">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Side */}
          <div className="col-md-6 mb-4 mb-md-0">
            <h6 className="text-success fw-semibold">Our Mission</h6>
            <h2 className="fw-bold">
              Responsible Waste Disposal for a <br />
              Healthier Tomorrow
            </h2>
          </div>

          {/* Right Side */}
          <div className="col-md-6">
            <ul className="list-unstyled">
              <li className="d-flex mb-2">
                <span className="text-success me-2">✔</span>
                Deliver efficient, eco-friendly waste collection, recycling, and disposal services.
              </li>
              <li className="d-flex mb-2">
                <span className="text-success me-2">✔</span>
                Promote sustainability through waste reduction, reuse, and recycling initiatives.
              </li>
              <li className="d-flex mb-2">
                <span className="text-success me-2">✔</span>
                Ensure compliance with environmental regulations and best industry practices.
              </li>
              <li className="d-flex mb-2">
                <span className="text-success me-2">✔</span>
                Educate communities on responsible waste management and environmental stewardship.
              </li>
              <li className="d-flex">
                <span className="text-success me-2">✔</span>
                Utilize advanced technology to enhance waste management efficiency and sustainability.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
