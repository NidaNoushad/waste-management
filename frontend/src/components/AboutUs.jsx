import React, { useEffect,useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import "./AboutUs.css";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Footer from './Footer';
import Header from './Header';
import MainNavbar from './MainNavbar';

const AboutUs = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(null);
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    AOS.init({ duration: 1000 });

    if (location.state?.scrollToFAQ) {
      const section = document.getElementById("faq");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);
  const faqs = [
    {
      question: "How does GoTrash waste pickup work?",
      answer:
        "You can schedule a pickup by filling out a simple form with your waste details, preferred date, and address. Our team will collect it as per the schedule.",
    },
    {
      question: "Do you offer urgent or on-demand pickup?",
      answer:
        "Yes, GoTrash provides urgent pickup services for same-day or next-day collection, based on availability in your area.",
    },
    {
      question: "What types of waste do you collect?",
      answer:
        "We collect plastic, e-waste, organic waste, bulk waste, and more. Each type of waste has specific disposal and recycling processes.",
    },
    {
      question: "How do I check pickup availability in my city?",
      answer:
        "You can use our 'Check Availability' feature on the homepage to see the upcoming waste collection dates in your city.",
    },
    {
      question: "Is there a subscription or recurring pickup option?",
      answer:
        "Yes, you can choose daily, weekly, or monthly scheduled pickups for hassle-free waste management.",
    },
  ];

  return (
    <>
  <Header/>
  <MainNavbar/>
    <div className="about-section d-flex align-items-center" style={{ background: `url("/assets/Whitebackground.jpg")`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="container text-center" data-aos="fade-up">
       

        {/* Title */}
        <h1 className="about-title">About Us</h1>

        {/* Breadcrumb */}
        <p className="breadcrumb-text" >
  <Link to="/" className="breadcrumb-link" style={{color:"black"}}>Home</Link>
  <span className="mx-2">{">"}</span>
  <Link to="/aboutus" className="breadcrumb-link active" style={{color:"black"}}>About Us</Link>
</p>

       
      </div>
    </div>

    {/* sec2 */}
    <section className="about-content-section py-5">
      <div className="container text-center text-white" data-aos="fade-up">
        <h2 className="welcome-title">
          Welcome to <span className="highlight">GoTrash Waste Management</span>
        </h2>

        <p className="mt-4">
          GoTrash is a modern waste management company committed to providing
          efficient, eco-friendly, and affordable waste disposal solutions for
          households and businesses across the region.
        </p>

        <p className="mt-3">
          We handle all kinds of waste with proper industry practices, ensuring
          quality, safety, and sustainability. Our services include on-demand
          pickups, scheduled waste collection, and specialized recycling
          programs. With GoTrash, you get peace of mind that your waste is
          managed responsibly and your surroundings stay clean.
        </p>

        <p className="mt-3">
          Our goal is to redefine waste management by combining technology,
          professional service, and environmental responsibility. We aim to make
          waste collection easier, smarter, and greener for everyone.
        </p>
      </div>
    </section>

    {/* sec3 */}
    <section className="mission-vision-section py-5">
      <div className="container">
        <div className="row g-4">
          {/* Mission Card */}
          <div className="col-md-6" data-aos="fade-up">
            <div className="card mission-card h-100 text-center text-white">
              <img
                src="/assets/about1.jpg"
                className="card-img-top"
                alt="Our Mission"
              />
              <div className="card-body">
                <h4 className="card-title">Our Mission</h4>
                <p className="card-text">
                  At GoTrash, our mission is to create a cleaner and healthier
                  environment by providing efficient, affordable, and
                  eco-friendly waste management services. We aim to reduce waste
                  pollution and encourage recycling practices that protect our
                  planet.
                </p>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
            <div className="card mission-card h-100 text-center text-white">
              <img
                src="/assets/about2.png"
                className="card-img-top"
                alt="Our Vision"
              />
              <div className="card-body">
                <h4 className="card-title">Our Vision</h4>
                <p className="card-text">
                  Our vision is to be the leading waste management company that
                  inspires communities and businesses to embrace sustainable
                  practices. We strive for a future where waste is minimized,
                  resources are reused, and recycling is a way of life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* faq */}
    <section className="faq-section py-5" id="faq">
      <div className="container">
        <div className="text-center mb-5" data-aos="fade-up">
          <h6 className="text-uppercase text-success fw-bold">Frequently Asked Questions</h6>
          <h2 className="fw-bold">
            You ask? <span className="text-success">We answer</span>
          </h2>
        </div>

        <div className="row">
          {faqs.map((faq, index) => (
            <div
              className="col-md-6 mb-3"
              key={index}
              data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
            >
              <div
                className={`faq-card p-3 shadow-sm ${
                  activeIndex === index ? "active" : ""
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="faq-question mb-0">{faq.question}</h5>
                  <span className="faq-icon">{activeIndex === index ? "−" : "+"}</span>
                </div>
                {activeIndex === index && (
                  <p className="faq-answer mt-2">{faq.answer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <Footer/>
    </>
  );
};

export default AboutUs;
