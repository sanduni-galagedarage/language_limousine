import { useEffect } from 'react';

const StructuredData = () => {
  useEffect(() => {
    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Language Limousine",
      "url": "https://languagelimousine.com",
      "logo": "https://languagelimousine.com/logo.png",
      "description": "Professional student transportation services with real-time tracking and experienced drivers",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "availableLanguage": ["English"]
      },
      "sameAs": [
        "https://facebook.com/languagelimousine",
        "https://twitter.com/languagelimousine",
        "https://instagram.com/languagelimousine"
      ]
    };

    // Local Business Schema
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Language Limousine",
      "image": "https://languagelimousine.com/logo.png",
      "url": "https://languagelimousine.com",
      "description": "Safe and reliable student transportation services",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "150"
      }
    };

    // Service Schema
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Student Transportation Service",
      "provider": {
        "@type": "Organization",
        "name": "Language Limousine"
      },
      "areaServed": {
        "@type": "Country",
        "name": "United States"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Transportation Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Daily School Transportation",
              "description": "Regular daily pickup and drop-off service for students"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Real-Time Tracking",
              "description": "GPS tracking for parents to monitor student location"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Professional Drivers",
              "description": "Experienced and background-checked drivers"
            }
          }
        ]
      }
    };

    // Website Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Language Limousine",
      "url": "https://languagelimousine.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://languagelimousine.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    // Combine all schemas
    const allSchemas = [
      organizationSchema,
      localBusinessSchema,
      serviceSchema,
      websiteSchema
    ];

    // Create or update script tag
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(allSchemas);

    return () => {
      // Cleanup on unmount
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, []);

  return null;
};

export default StructuredData;
