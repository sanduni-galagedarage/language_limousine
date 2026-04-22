import React from "react";
import { ChevronRight, ArrowUp } from "lucide-react";

const FooterSection = () => {
  const usefulLinks = [
    { name: "Home", href: "#" },
    { name: "About Us", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ];

  return (
    <footer className="relative bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-white rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-white rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-12">
          {/* Left Column - Logo and Description */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="mb-8">
              <div className="bg-white p-4 rounded-lg inline-block">
                <div className="flex items-center space-x-3">
                  {/* Car Icon */}
                  <div className="w-12 h-8 bg-blue-600 rounded-md relative">
                    <div className="absolute bottom-0 left-1 w-3 h-3 bg-gray-800 rounded-full"></div>
                    <div className="absolute bottom-0 right-1 w-3 h-3 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-1 left-2 right-2 h-2 bg-blue-400 rounded-sm"></div>
                  </div>

                  {/* Logo Text */}
                  <div>
                    <div className="text-blue-600 font-bold text-lg leading-tight">
                      LANGUAGE
                      <br />
                      LIMOUSINE
                    </div>
                    <div className="text-gray-600 text-xs font-medium mt-1">
                      A PRIVATE WELCOME PICK UP SERVICE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="max-w-md">
              <p className="text-gray-300 text-base leading-relaxed">
                Language Limousine staff are at the airport daily, ensuring
                efficient student pickup with our experienced and professional
                service.
              </p>
            </div>
          </div>

          {/* Right Column - Useful Links */}
          <div className="lg:pl-12">
            <h3 className="text-white text-xl font-bold mb-8 tracking-wide">
              USEFUL LINKS
            </h3>

            <nav className="space-y-4">
              {usefulLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="group flex items-center text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <ChevronRight className="w-4 h-4 mr-3 text-orange-500 group-hover:translate-x-1 transition-transform duration-200" />
                  <span className="text-base font-medium">{link.name}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="text-center lg:text-left">
            <p className="text-gray-400 text-sm">
              Copyright©{" "}
              <span className="text-orange-500 font-medium">
                Language Limousine
              </span>{" "}
              | All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
