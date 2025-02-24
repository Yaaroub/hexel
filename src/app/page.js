import { motion } from "framer-motion";
import HexelLogo from "./(components)/canvas/HexelLogo.jsx";
import HeroSection from "./(components)/sections/Hero";
import ServicesSection from "./(components)/sections/Services";

export default function Home() {
  return (
    <>
      <HeroSection />

      <ServicesSection />
    </>
  );
}
