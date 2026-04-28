import FooterSection from "@/components/Components/Footer";
import AnimatedStatsSection from "@/components/Components/HomeComponents/AnimatedCounter";
import CustomerReviewsCarousel from "@/components/Components/HomeComponents/CustomerReviewCarousel";
import LanguageLimousineHero from "@/components/Components/HomeComponents/Hero";
import ParentsTrustSection from "@/components/Components/HomeComponents/ParentTrust";
import StudentTransportService from "@/components/Components/HomeComponents/StudentTransport";
import TravelServicesSection from "@/components/Components/HomeComponents/TravelService";
import NavigationBar from "@/components/Components/Navigationbar";
import ScrollToTopButton from "@/components/Components/ScrollTop";
import SimpleLoader from "@/components/Components/SimpleLoader";
import SEO from "@/components/SEO";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <SEO 
        title="Language Limousine - Safe & Reliable Student Transportation Services"
        description="Professional student transportation services with real-time tracking, experienced drivers, and guaranteed safety. Trusted by parents and schools for reliable daily commutes."
        keywords="student transportation, school limousine service, safe student transport, school bus alternative, student pickup service, reliable school transport, student safety"
      />
      <NavigationBar />
      {isLoading ? (
        <SimpleLoader />
      ) : (
        <>
          <LanguageLimousineHero />
          <TravelServicesSection />
          <ParentsTrustSection />
          <StudentTransportService />
          {/* <AnimatedStatsSection /> */}
          <CustomerReviewsCarousel />
          <FooterSection />
          <ScrollToTopButton />
        </>
      )}
    </div>
  );
}
