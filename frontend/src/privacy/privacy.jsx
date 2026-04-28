import FooterSection from "@/components/Components/Footer";
import NavigationBar from "@/components/Components/Navigationbar";
import PrivacyPolicyComponent from "@/components/Components/PrivacyPloiciesCompnents/Details";
import PrivacyPolicyHero from "@/components/Components/PrivacyPloiciesCompnents/Hero";
import LanguageLimousinePrivacy from "@/components/Components/PrivacyPloiciesCompnents/SecondHeroSection";
import ScrollToTopButton from "@/components/Components/ScrollTop";
import SimpleLoader from "@/components/Components/SimpleLoader";
import { useEffect, useState } from "react";

export default function Privacy() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <NavigationBar />
      {isLoading ? (
        <SimpleLoader />
      ) : (
        <>
          <PrivacyPolicyHero />
          <LanguageLimousinePrivacy />
          <PrivacyPolicyComponent />
          {/* <AnimatedStatsSection /> */}
          <FooterSection />
          <ScrollToTopButton />
        </>
      )}
    </div>
  );
}
