import React, { useState, useEffect } from "react";
import newImage from "../../../../public/images/new.jpg";

const TravelServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("travel-services");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      icon: (
        <svg
          className="w-8 h-8 text-orange-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 2v2h2V2h8v2h2V2h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2z" />
          <rect x="4" y="8" width="16" height="2" />
          <rect x="4" y="12" width="16" height="2" />
          <rect x="4" y="16" width="8" height="2" />
        </svg>
      ),
      title: "Airport Transportation",
      subtitle: "Seamless Arrival Experience",
      description:
        "Enjoy a stress-free journey with our service, ensuring you reach your",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      icon: (
        <svg
          className="w-8 h-8 text-orange-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.46 9-11V7l-10-5z" />
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      ),
      title: "Hostel & Campus Transfers",
      subtitle: "Door-to-Door Convenience",
      description:
        "We provide safe, direct transportation from the airport to your hostel or",
    },
    {
      id: 3,
      image: newImage,
      icon: (
        <svg
          className="w-8 h-8 text-orange-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      ),
      title: "24/7 Support Service",
      subtitle: "Support Anytime, Anywhere",
      description:
        "Our team is available around the clock to assist with any travel-related questions",
    },
  ];

  return (
    <section id="travel-services" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div
          className={`text-center mb-16 md:mb-20 transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            MAKING TRAVELLING EASIER FOR
            <br />
            <span className="text-gray-800">INTERNATIONAL STUDENTS</span>
          </h2>

          {/* Orange underline */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-1 bg-orange-500 rounded-full"></div>
          </div>

          <p className="text-gray-600 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            Locating someone in a large airport can be difficult. Our staff are
            knowledgeable and experienced with the facility. Let us guide you on
            your adventure.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Image Container */}
              <div className="relative h-64 md:h-72 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* 24/7 Badge for Support Service */}
                {service.id === 3 && (
                  <div className="absolute top-6 right-6 w-20 h-20 border-2 border-white rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <span className="text-white font-bold text-lg">24/7</span>
                  </div>
                )}

                {/* Icon Container */}
                <div className="absolute bottom-6 left-6">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                  {service.title}
                </h3>

                <h4 className="text-orange-500 font-semibold text-lg mb-4">
                  {service.subtitle}
                </h4>

                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div
          className={`text-center mt-16 md:mt-20 transform transition-all duration-1000 delay-600 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
            <span className="relative z-10">Learn More About Our Services</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TravelServicesSection;
