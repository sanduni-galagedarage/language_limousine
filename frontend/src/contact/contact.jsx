import FooterSection from "@/components/Components/Footer";
import NavigationBar from "@/components/Components/Navigationbar";
import ContactHero from "@/components/Components/ContactComponents/Hero";
import ScrollToTopButton from "@/components/Components/ScrollTop";
import SimpleLoader from "@/components/Components/SimpleLoader";
import { useEffect, useState } from "react";

export default function Contact() {
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
          <ContactHero />
          <FooterSection />
          <ScrollToTopButton />
        </>
      )}
    </div>
  );
}
