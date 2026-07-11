import React from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { Link } from 'react-router-dom';
import './ServicesCards.css'; // Custom styles here


AOS.init();

const services = [
  {
    title: "Residential Pickup",
    image: '/assets/residential1.png',
    desc: "Regular doorstep waste collection for households. GoTrash ensures your daily or weekly waste is collected on time and disposed of responsibly.",
    link: "/service/residentialpickup"
  },
  {
    title: "Bulk Waste ",
    image: '/assets/bulk1.jpg',
    desc: "Hassle-free collection of large waste loads (like furniture, appliances, or above 25 kg). Ideal for home clean-ups, offices, or events.",
    link: "/services/bulk"
  },
  {
    title: "Scheduled Pickup",
    image: '/assets/schedule1.jpg',
    desc: "Plan your waste collection in advance with flexible options – daily, weekly, or monthly. Perfect for consistent and reliable service.",
    link: "/services/schedule"
  },
  {
    title: "On-Demand Pickup",
    image: '/assets/rp2.jpeg',
    desc: "Urgent waste collection service for same-day or next-day needs. Quick, convenient, and available whenever you need it most.",
    link: "/services/ondemand"
  }
];

const ServicesCards = () => {
  return (
    // <div className="container-fluid px-0">
    <div className="row no-gutters g-0">
      
        {services.map((service, index) => (
          <div
            key={index}
            className="col-12 col-sm-6 col-md-6 col-lg-3 mb-4"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <div className="service-card position-relative overflow-hidden">
              <img src={service.image} className="img-fluid w-100 h-100 object-fit-cover" alt={service.title} />
              <h5 className='text-white fw-bold'>{service.title}</h5>
              <div className="overlay">
                <h5 className="text-white fw-bold">{service.title}</h5>
                <p className="desc-text">{service.desc}</p>
                <Link to={service.link} className="view-btn v-btn">
  View Details
</Link>
                
              </div>
            </div>
          </div>

        ))}
      </div>
    
  );
};

export default ServicesCards;
