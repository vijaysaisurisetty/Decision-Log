import React, { useEffect } from "react";
import HeroBand from "../components/landing/HeroBand";
import BuiltWithStrip from "../components/landing/BuiltWithStrip";
import HowItWorksBand from "../components/landing/HowItWorksBand";
import ProductPreviewBand from "../components/landing/ProductPreviewBand";
import WordOnTheStreetBand from "../components/landing/WordOnTheStreetBand";
import StatBand from "../components/landing/StatBand";
import CtaBand from "../components/landing/CtaBand";

export default function Landing() {
  useEffect(() => {
    document.title = "DecisionLog · Remember the Why";
  }, []);

  return (
    <main id="main-content" style={{ flex: 1 }}>
      <HeroBand />
      <BuiltWithStrip />
      <HowItWorksBand />
      <ProductPreviewBand />
      <WordOnTheStreetBand />
      <StatBand />
      <CtaBand />
    </main>
  );
}

