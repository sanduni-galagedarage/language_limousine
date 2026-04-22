import LanguageLimousineDetailed from "@/components/Components/AboutUsComponents/Detail";
import AboutUsHero from "@/components/Components/AboutUsComponents/Hero";
import LanguageLimousine from "@/components/Components/AboutUsComponents/SecondHeroSection";
import FooterSection from "@/components/Components/Footer";
import AnimatedStatsSection from "@/components/Components/HomeComponents/AnimatedCounter";
import LanguageLimousineLoader from "@/components/Components/Loader";
import NavigationBar from "@/components/Components/Navigationbar";
import ScrollToTopButton from "@/components/Components/ScrollTop";
import { useEffect, useState } from "react";

export default function AboutUs() {
  const [isLoading, setIsLoading] = useState(true);

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
          <AboutUsHero />
          <LanguageLimousine />
          <LanguageLimousineDetailed />
          <AnimatedStatsSection />
          <FooterSection />
          <ScrollToTopButton />
        </div>
      )}
    </div>
  );
}
