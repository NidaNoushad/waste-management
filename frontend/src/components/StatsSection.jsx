// StatsSection.jsx
import { useEffect } from "react";
import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import "./ContactBanner.css"; 
import AOS from 'aos';
import 'aos/dist/aos.css';
import {Link} from 'react-router-dom';




const stats = [
  { number: 28950, label: 'Happy Customers' },
  { number: 240, label: 'Pickup Points' },
  { number: 158, label: 'Skilled Workers' },
  { number: 50, label: 'Request Completed' },
];

export default function StatsSection() {
  const { ref, inView } = useInView({ triggerOnce: true });

 useEffect(() => {
    AOS.init();
  }, []);

  return (
 <>
    <div className="container-fluid text-white" ref={ref} style={{backgroundColor:"#064420",paddingTop:"100px", paddingBottom:"200px", position:"relative", zIndex:"1"}}>
      <div className="row text-center">
        {stats.map((item, index) => (
          <div
            key={index}
            className="col-6 col-md-3 mb-4"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <h2 className="display-6 fw-bold">
              {inView ? <CountUp end={item.number} duration={2} /> : '0'}<span style={{color:"green"}}>+</span>
            </h2>
            <p className="fw-semibold">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
    {/* sECTION2 */}
    <div className="contact-banner-wrapper">
      <div className="container">
        <div className="contact-banner-box" style={{backgroundImage:"url(assets/impact.jpg)"}}>
          <div className="overlay"></div>
          <div 
            data-aos="zoom-in"
            data-aos-duration="1000"
            data-aos-offset="100"
            data-aos-once="true"
            // data-aos-anchor-placement="center-center"
            className="contact-banner-content d-flex flex-column justify-content-center align-items-center text-center py-5">
            <h2>Register now to<br />schedule your waste<br />service and keep your<br />space clean</h2>
          </div>
          {/* <Link to="\" className="text-decoration-none" style={{zIndex:"2"}}>
          <div className="contact-banner-call-box"
          data-aos="zoom-in"
          data-aos-duration="1000"
          data-aos-offset="100"
          data-aos-once="true"
            <img src="/assets/registered.png" alt="Recycling" className="icon mb-2" />
            <h5>Register now</h5>
          </div>
          </Link> */}
          <Link to="/login?mode=register" className="text-decoration-none" style={{zIndex:"2"}}>
  <div className="contact-banner-call-box" data-aos="zoom-in">
    <img src="/assets/registered.png" alt="Recycling" className="icon mb-2" />
    <h5>Register now</h5>
  </div>
</Link>
        </div>
      </div>
    </div>
    </>
  );
}
