import FooterSection from "@/components/Components/Footer";
import AnimatedStatsSection from "@/components/Components/HomeComponents/AnimatedCounter";
import LanguageLimousineLoader from "@/components/Components/Loader";
import NavigationBar from "@/components/Components/Navigationbar";
import PrivacyPolicyComponent from "@/components/Components/PrivacyPloiciesCompnents/Details";
import PrivacyPolicyHero from "@/components/Components/PrivacyPloiciesCompnents/Hero";
import LanguageLimousinePrivacy from "@/components/Components/PrivacyPloiciesCompnents/SecondHeroSection";
import ScrollToTopButton from "@/components/Components/ScrollTop";
import { useEffect, useState } from "react";

export default function Privacy() {
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
          <PrivacyPolicyHero />
          <LanguageLimousinePrivacy />
          <PrivacyPolicyComponent />
          <AnimatedStatsSection />
          <FooterSection />
          <ScrollToTopButton />
        </div>
      )}
    </div>
  );
}
