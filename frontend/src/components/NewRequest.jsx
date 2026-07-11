import React, { useState } from "react";
import PricingSelectionForm from "./PricingSelectionForm";
import NewContactDetails from "./NewContactDetails";
import PaymentPage from "./PaymentPage";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewRequest = () => {
  const [step, setStep] = useState(1); // 1 = pricing, 2 = contact
  const [formData, setFormData] = useState({}); // store combined data
  const navigate = useNavigate();

  const handlePricingConfirm = (pricingData) => {
    setFormData((prev) => ({ ...prev, ...pricingData }));
    setStep(2);
  };

  const handleContactConfirm = (contactData) => {
    setFormData((prev) => ({ ...prev, ...contactData }));
   
    setStep(3);
  
  };


  const handlePaymentSuccess = (responseData) => {
    // If responseData has paymentMethod = cash, redirect to receipt page
    if (responseData.payment_method === "cash" || responseData.id) {
   
      navigate(`/receipt/${responseData.id}`); 
    } else {
      // For card or UPI, redirect to payment gateway page
      navigate(`/payment-gateway?method=${responseData.paymentMethod}`);
    }
  };
  

  return (
    <>
      {step === 1 && (
        <PricingSelectionForm
         onConfirm={handlePricingConfirm}
         defaultValues={formData}
          />
      )}

      {step === 2 && (
        <NewContactDetails
          onSubmit={handleContactConfirm}
          onBack={() => setStep(1)}
          defaultValues={formData}
        />
      )}

{step === 3 && (
        <PaymentPage
          data={formData}
          onBack={() => setStep(2)}
        
          onConfirm={() => {}}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default NewRequest;
