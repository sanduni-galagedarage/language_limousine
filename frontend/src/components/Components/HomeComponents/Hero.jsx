import React, { useState, useEffect } from "react";
import { ArrowRight, MapPin, Clock, Shield, Globe } from "lucide-react";
import Wave from "react-wavify";
import flightImage from "../../../assets/flight.jpg";

const LanguageLimousineHero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { icon: MapPin, text: "Airport Pickup" },
    { icon: Clock, text: "24/7 Service" },
    { icon: Shield, text: "Safe & Secure" },
    { icon: Globe, text: "Global Coverage" },
  ];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "110vh" }}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={flightImage}
          alt="Flight background"
          className="w-full h-full object-cover md:object-center object-top"
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Blur overlay at bottom for wave area */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/30 to-transparent backdrop-blur-md"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Left Aligned Content (Desktop) / Center Aligned (Mobile) */}
          <div className="space-y-6 max-w-3xl text-center md:text-left mx-auto md:mx-0">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 transform transition-all duration-1000 ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
              }`}
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-white text-xs md:text-sm font-bold tracking-wide">
                PREMIUM STUDENT TRANSPORTATION
              </span>
            </div>

            {/* Main Heading */}
            <div
              className={`space-y-3 transform transition-all duration-1000 delay-200 ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
              }`}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight text-white drop-shadow-2xl">
                LANGUAGE
                <br />
                LIMOUSINE
              </h1>
              <div className="w-16 h-1 bg-white rounded-full mx-auto md:mx-0"></div>
            </div>

            {/* Subtitle */}
            <p
              className={`text-lg md:text-xl lg:text-2xl text-white font-medium leading-relaxed drop-shadow-lg transform transition-all duration-1000 delay-400 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              Safe, reliable airport transportation for international students worldwide
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start transform transition-all duration-1000 delay-600 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <button className="group px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                Book Your Ride
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 font-bold text-base rounded-full shadow-2xl hover:shadow-white/50 border-2 border-white transition-all duration-300 transform hover:scale-105">
                Learn More
              </button>
            </div>

            {/* Stats */}
            {/* <div
              className={`grid grid-cols-3 gap-3 md:gap-4 pt-6 max-w-2xl transform transition-all duration-1000 delay-800 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
                <div className="text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-lg">
                  15K+
                </div>
                <div className="text-xs md:text-sm text-white font-semibold mt-1">
                  Students Served
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
                <div className="text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-lg">
                  60+
                </div>
                <div className="text-xs md:text-sm text-white font-semibold mt-1">
                  Countries
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
                <div className="text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-lg">
                  99%
                </div>
                <div className="text-xs md:text-sm text-white font-semibold mt-1">
                  Satisfaction
                </div>
              </div>
            </div> */}

            {/* Bottom Features Bar */}
            {/* <div
              className={`mt-8 md:mt-12 transform transition-all duration-1000 delay-1000 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-bold text-white text-sm md:text-base">{feature.text}</h4>
                      <p className="text-xs text-gray-200 mt-0.5">Available 24/7</p>
                    </div>
                  );
                })}
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Wave Effect at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <Wave
          fill="white"
          paused={false}
          style={{ display: "flex" }}
          options={{
            height: 20,
            amplitude: 25,
            speed: 0.2,
            points: 4,
          }}
        />
      </div>
    </div>
  );
};

export default LanguageLimousineHero;
