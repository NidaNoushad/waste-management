

import React, { useEffect, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Testimonials.css'; // Custom styles here

const testimonialsData = [
  { name: "Bryan G.", review: "Reliable and efficient service, highly recommended!" },
  { name: "Michael S.", review: "Always on time, and they care about the environment." },
  { name: "Robert L.", review: "Clean and professional. We love working with them!" },
  { name: "Jake M.", review: "Affordable and top-quality service!" },
  { name: "Lara B.", review: "Booking is easy and they never disappoint!" },
  { name: "Emily R.", review: "Staff is friendly, and service is perfect." },
  { name: "Chris T.", review: "A great company for regular waste management." },
  { name: "Diana W.", review: "Never had any issue. They are awesome!" }
];

const Testimonials = () => {
  const sliderRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const slideLeft = () => {
    sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const slideRight = () => {
    sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="container my-5 py-5" data-aos="fade-up">
      <div className="text-center mb-4">
        <h6 className="text-success">Testimonials</h6>
        <h2 className="fw-bold">Our Happy Customers</h2>
      </div>

      <div className="testimonial-slider-container">
        <button className="slider-btn left" onClick={slideLeft}>‹</button>
        <div className="testimonial-slider" ref={sliderRef}>
          {testimonialsData.map((item, index) => (
            <div className="testimonial-card" key={index}>
              <div className="card h-100 shadow border-0 p-3">
                <div className="card-body">
                  <p className="fs-6 fst-italic">"{item.review}"</p>
                  <h6 className="fw-bold mt-3 mb-0">{item.name}</h6>
                  <p className="text-muted mb-0">Customer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="slider-btn right" onClick={slideRight}>›</button>
      </div>
    </div>
  );
};

export default Testimonials;
