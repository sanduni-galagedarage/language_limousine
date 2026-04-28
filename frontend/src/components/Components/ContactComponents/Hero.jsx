import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

const ContactHero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "book@languagelimousine.com",
      link: "mailto:book@languagelimousine.com",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "778-773-5466",
      link: "tel:778-773-5466",
      color: "from-green-500 to-green-600"
    },
    {
      icon: MapPin,
      title: "Service Area",
      content: "Available Worldwide",
      link: null,
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Clock,
      title: "Availability",
      content: "24/7 Service",
      link: null,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="relative bg-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Hero Content */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div
            className={`flex items-center justify-center space-x-2 text-sm mb-8 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
            }`}
          >
            <a href="/" className="text-gray-500 hover:text-orange-500 transition-colors">
              Home
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-orange-500 font-semibold">Contact Us</span>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-8">
            {/* Icon Badge */}
            <div
              className={`inline-flex items-center justify-center transition-all duration-700 delay-100 ${
                isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl blur-xl opacity-30"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <MessageCircle className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <div
              className={`space-y-4 transition-all duration-700 delay-200 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
                Get in Touch
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-12 h-1.5 bg-orange-300 rounded-full"></div>
                <div className="w-12 h-1.5 bg-orange-500 rounded-full"></div>
                <div className="w-12 h-1.5 bg-orange-300 rounded-full"></div>
              </div>
            </div>

            {/* Description */}
            <p
              className={`text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto transition-all duration-700 delay-400 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              We're here to answer your questions and provide the best service possible.
              <br />
              Reach out to us anytime!
            </p>

            {/* Contact Cards Grid */}
            <div
              className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16 transition-all duration-700 delay-600 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm font-semibold mb-2">
                          {info.title}
                        </p>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-gray-900 text-base font-bold hover:text-orange-500 transition-colors break-all"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-gray-900 text-base font-bold">
                            {info.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Info Section */}
            <div
              className={`max-w-4xl mx-auto mt-16 transition-all duration-700 delay-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-10 shadow-2xl">
                <h3 className="text-3xl font-black text-white mb-6">Why Choose Language Limousine?</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Professional Drivers</h4>
                      <p className="text-white/90 text-sm">Experienced and certified professionals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">24/7 Support</h4>
                      <p className="text-white/90 text-sm">Always available when you need us</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Real-Time Tracking</h4>
                      <p className="text-white/90 text-sm">Monitor your ride in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Safe & Reliable</h4>
                      <p className="text-white/90 text-sm">Your safety is our priority</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHero;
