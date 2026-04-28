import React, { useEffect, useState } from "react";
import { Shield, Lock, Eye, FileText, CheckCircle } from "lucide-react";

export default function PrivacyPolicyHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { icon: Shield, text: "Data Protection" },
    { icon: Lock, text: "Secure Storage" },
    { icon: Eye, text: "Transparency" },
    { icon: CheckCircle, text: "GDPR Compliant" },
  ];

  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

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
            <span className="text-orange-500 font-semibold">Privacy Policy</span>
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
                <div className="absolute inset-0 bg-orange-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                  <Shield className="w-12 h-12 text-white" strokeWidth={2} />
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
                Privacy
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                  Policy
                </span>
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-12 h-1.5 bg-gradient-to-r from-transparent to-orange-500 rounded-full"></div>
                <div className="w-12 h-1.5 bg-orange-500 rounded-full"></div>
                <div className="w-12 h-1.5 bg-gradient-to-l from-transparent to-orange-500 rounded-full"></div>
              </div>
            </div>

            {/* Description */}
            <p
              className={`text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto transition-all duration-700 delay-400 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              Your privacy is our top priority. We are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data.
            </p>

            {/* Feature Cards */}
            <div
              className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 transition-all duration-700 delay-600 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-orange-600" strokeWidth={2} />
                      </div>
                      <p className="text-sm font-bold text-gray-800">{feature.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Element */}
      <div className="relative h-20 bg-gradient-to-b from-transparent to-white"></div>
    </div>
  );
}
