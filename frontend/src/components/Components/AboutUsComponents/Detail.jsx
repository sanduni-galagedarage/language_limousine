import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const LanguageLimousineDetailed = () => {
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

    const element = document.getElementById("language-limousine-detailed");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="language-limousine-detailed"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-200 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Content Section */}
          <div className="space-y-8">
            {/* Title Section */}
            <div
              className={`transform transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                LANGUAGE LIMOUSINE
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold text-orange-600 mb-6">
                Professional student transportation services
              </h2>
            </div>

            {/* Services Content */}
            <div
              className={`space-y-6 transform transition-all duration-1000 delay-500 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              {/* Licensed Vehicles */}
              <div className="group">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                  Licensed Vehicles
                </h3>
                <p className="text-gray-600 leading-relaxed pl-5">
                  We at Language Limousine have a variety of licensed vehicles.
                  We have developed strategies to maximize the probability of
                  meeting your student and thereby ensuring them a great welcome
                  to Canada.
                </p>
              </div>

              {/* Live Tracking */}
              <div className="group">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                  Live Tracking
                </h3>
                <p className="text-gray-600 leading-relaxed pl-5">
                  We offer a "live" website that allows you, your agents, host
                  families, and the students' parents real time information.
                  With one click, our Student Tracking allows you to track if
                  the student has been greeted, is in transit, or has made it to
                  their homestay.
                </p>
              </div>

              {/* 24 Hour Access */}
              <div className="group">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                  24 Hour Access
                </h3>
                <p className="text-gray-600 leading-relaxed pl-5">
                  Students have 24 hour "live" access to our company and are
                  given our "Upon Your Arrival" letter that advises them of our
                  emergency number, tells them exactly where to meet us (map
                  included), has pictures of our uniformed staff, and folded is
                  a sign that they can hold as they arrive that allows us to
                  immediately identify them.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div
              className={`transform transition-all duration-1000 delay-700 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-orange-600 hover:to-red-600 group">
                <span>Learn More About Our Services</span>
                <svg
                  className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Image Section */}
          <div
            className={`relative transform transition-all duration-1000 delay-400 ${
              isVisible
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-20 opacity-0 scale-95"
            }`}
          >
            <Card className="overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group">
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Student at airport with luggage"
                    className="w-full h-96 lg:h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Floating Info Cards */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-800">
                        Live Tracking Active
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 bg-orange-500 text-white rounded-full p-2 shadow-lg transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Badges */}
            <div className="absolute -bottom-6 -left-6 flex flex-col space-y-3">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold transform rotate-3 hover:rotate-0 transition-transform duration-300">
                Licensed & Insured
              </div>
              <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                24/7 Available
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div
          className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 transform transition-all duration-1000 delay-900 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Reliable Service
            </h3>
            <p className="text-gray-600 text-sm">Since 2003</p>
          </div>

          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Real-time Tracking
            </h3>
            <p className="text-gray-600 text-sm">Live updates</p>
          </div>

          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              24/7 Support
            </h3>
            <p className="text-gray-600 text-sm">Always available</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
};

export default LanguageLimousineDetailed;
