import React, { useEffect, useState } from "react";

const LanguageLimousine = () => {
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

    const element = document.getElementById("language-limousine");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="language-limousine"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gray-200 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div
            className={`transform transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-wider mb-6 relative">
              <span
                className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent"
                style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                LANGUAGE LIMOUSINE
              </span>

              {/* Animated underline */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div
                  className={`h-1 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 transition-all duration-1000 delay-800 ${
                    isVisible ? "w-32" : "w-0"
                  }`}
                />
              </div>
            </h2>
          </div>
        </div>

        {/* Content Section */}
        <div
          className={`transform transition-all duration-1000 delay-600 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="relative">
            {/* Quote marks */}
            <div className="absolute -top-4 -left-4 text-6xl text-blue-200 font-serif leading-none opacity-50">
              "
            </div>
            <div className="absolute -bottom-8 -right-4 text-6xl text-blue-200 font-serif leading-none opacity-50">
              "
            </div>

            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed text-center max-w-4xl mx-auto font-light tracking-wide px-8">
              <span className="font-semibold text-slate-800">
                Operating since 2003
              </span>
              , Language Limousine has made every effort to take care of
              students travelling abroad. From start to finish, our staff are
              there to make sure they have arrived safely, collected all their
              baggage, and made it all the way to their new residence.
              <span className="font-semibold text-slate-800">
                The same great experience
              </span>{" "}
              can be expected once it is time to return home.
            </p>
          </div>

          {/* Stats or Features */}
          <div
            className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 transform transition-all duration-1000 delay-900 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <span className="text-2xl font-bold text-white">20+</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Years Experience
              </h3>
              <p className="text-gray-600 text-sm">Since 2003</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <span className="text-2xl font-bold text-white">✈</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Safe Travel
              </h3>
              <p className="text-gray-600 text-sm">End-to-end care</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <span className="text-2xl font-bold text-white">🏠</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Full Service
              </h3>
              <p className="text-gray-600 text-sm">Door to door</p>
            </div>
          </div>

          {/* Call to Action */}
          <div
            className={`mt-12 text-center transform transition-all duration-1000 delay-1200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          ></div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-200 rounded-full animate-spin-slow opacity-30" />
      <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-indigo-200 rounded-full animate-bounce opacity-30" />

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
};

export default LanguageLimousine;
