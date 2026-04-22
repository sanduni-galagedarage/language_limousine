import FooterSection from "@/components/Components/Footer";
import AnimatedStatsSection from "@/components/Components/HomeComponents/AnimatedCounter";
import CustomerReviewsCarousel from "@/components/Components/HomeComponents/CustomerReviewCarousel";
import LanguageLimousineHero from "@/components/Components/HomeComponents/Hero";
import ParentsTrustSection from "@/components/Components/HomeComponents/ParentTrust";
import StudentTransportService from "@/components/Components/HomeComponents/StudentTransport";
import TravelServicesSection from "@/components/Components/HomeComponents/TravelService";
import LanguageLimousineLoader from "@/components/Components/Loader";
import NavigationBar from "@/components/Components/Navigationbar";
import ScrollToTopButton from "@/components/Components/ScrollTop";
import ModeToggle from "@/components/mode-toggle";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
//use state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {isLoading ? (
        <LanguageLimousineLoader />
      ) : (
        <div>
          <NavigationBar />
          <LanguageLimousineHero />
          <TravelServicesSection />
          <ParentsTrustSection />
          <StudentTransportService />
          <AnimatedStatsSection />
          <CustomerReviewsCarousel />
          <FooterSection />
          <ScrollToTopButton />
        </div>
      )}
    </div>
  );
}
