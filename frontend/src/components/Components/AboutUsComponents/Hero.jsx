import React, { useEffect, useState } from "react";
import { ArrowRight, Users, Award, Globe, Shield } from "lucide-react";

const AboutUsHero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: Users, value: "15K+", label: "Students Served" },
    { icon: Globe, value: "60+", label: "Countries" },
    { icon: Award, value: "10+", label: "Years Experience" },
    { icon: Shield, value: "99%", label: "Safety Rating" },
  ];

  return (
    <div className="relative bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Breadcrumb */}
              <div
                className={`flex items-center space-x-2 text-sm transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
                }`}
              >
                <a href="/" className="text-gray-500 hover:text-orange-500 transition-colors">
                  Home
                </a>
                <span className="text-gray-400">/</span>
                <span className="text-orange-500 font-semibold">About Us</span>
              </div>

              {/* Main Heading */}
              <div
                className={`space-y-4 transition-all duration-700 delay-200 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
                  Your Trusted
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                    Transportation
                  </span>
                  Partner
                </h1>
                <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
              </div>

              {/* Description */}
              <p
                className={`text-lg md:text-xl text-gray-600 leading-relaxed transition-all duration-700 delay-400 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
              >
                We provide safe, reliable, and professional transportation services for international students worldwide. Our commitment to excellence has made us the preferred choice for thousands of students.
              </p>

              {/* CTA Button */}
              <div
                className={`transition-all duration-700 delay-600 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
              >
                <button className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Learn More About Us
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Content - Image Grid */}
            <div
              className={`relative transition-all duration-700 delay-300 ${
                isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Large Image */}
                <div className="col-span-2 relative h-64 rounded-3xl overflow-hidden shadow-2xl group">
                  <img
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80"
                    alt="Airport transportation"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-2xl font-bold">Professional Service</p>
                    <p className="text-sm text-gray-200">24/7 Available</p>
                  </div>
                </div>

                {/* Small Images */}
                <div className="relative h-48 rounded-3xl overflow-hidden shadow-xl group">
                  <img
                    src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&q=80"
                    alt="Safe travel"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold">Safe Travel</p>
                  </div>
                </div>

                <div className="relative h-48 rounded-3xl overflow-hidden shadow-xl group">
                  <img
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80"
                    alt="Global coverage"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold">Global Reach</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-2xl p-6 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="text-center">
                  <p className="text-4xl font-black text-orange-500">10+</p>
                  <p className="text-sm font-semibold text-gray-600">Years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div
            className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-700 delay-800 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                      <p className="text-sm font-semibold text-gray-600 mt-1">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsHero;
