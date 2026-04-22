import React, { useState, useEffect } from "react";

const ParentsTrustSection = () => {
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

    const section = document.getElementById("parents-trust");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="parents-trust"
      className="py-16 md:py-24 bg-gray-100 relative overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-300 rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gray-400 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gray-300 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-gray-400 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content Section */}
          <div
            className={`transform transition-all duration-1000 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            }`}
          >
            {/* Main Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-8 leading-tight">
              PARENTS TRUST US
            </h2>

            {/* Orange Subtitle */}
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-orange-500 mb-8 leading-relaxed">
              We are the best in ensuring safe and comfortable arrivals when
              traveling abroad.
            </h3>

            {/* Description Text */}
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10">
              We are parents too. We take care of our students as if they are
              our own children. Safety and security are top priorities. Parents
              are able to utilize our student tracker while their child is with
              an assigned, and vetted, staff member.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                <span className="relative z-10">
                  Learn About Student Tracker
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button className="group relative px-8 py-4 border-2 border-gray-300 rounded-full text-gray-700 font-bold text-lg hover:border-orange-500 hover:text-orange-500 transition-all duration-300 transform hover:scale-105">
                <span className="relative z-10">Contact Us</span>
              </button>
            </div>

            {/* Trust Features */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.46 9-11V7l-10-5z" />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Vetted Staff</h4>
                  <p className="text-gray-600 text-sm">
                    Background checked professionals
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Live Tracking</h4>
                  <p className="text-gray-600 text-sm">
                    Real-time location updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Section */}
          <div
            className={`transform transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Happy family with child holding passport at airport"
                  className="w-full h-[500px] md:h-[600px] object-cover"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Statistics Cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-xl p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">99.8%</p>
                    <p className="text-gray-600 text-sm">Safe Arrivals</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 animate-pulse"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">4.9/5</p>
                    <p className="text-gray-600 text-sm">Parent Rating</p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
              <div
                className="absolute bottom-20 left-10 w-3 h-3 bg-blue-500 rounded-full animate-ping"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentsTrustSection;
