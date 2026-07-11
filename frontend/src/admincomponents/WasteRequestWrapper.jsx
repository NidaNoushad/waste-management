import React from "react";
import { useParams } from "react-router-dom";
import WasteRequestList from "./WasteRequestList";

const WasteRequestWrapper = () => {
  const { userId } = useParams();
  return <WasteRequestList key={userId} />;
};

export default WasteRequestWrapper;