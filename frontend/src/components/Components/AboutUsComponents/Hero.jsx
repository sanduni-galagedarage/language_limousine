import React, { useEffect, useState } from "react";

const AboutUsHero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Flight Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')`,
            transform: `translate(${mousePosition.x * 0.01}px, ${
              mousePosition.y * 0.01
            }px) scale(1.1)`,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

        {/* Animated Clouds */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-16 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-20 w-24 h-12 bg-white/5 rounded-full blur-lg animate-pulse delay-1000" />
          <div className="absolute bottom-32 left-1/4 w-40 h-20 bg-white/8 rounded-full blur-xl animate-pulse delay-2000" />
        </div>

        {/* Flying Objects Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-10 w-2 h-2 bg-white/60 rounded-full animate-pulse">
            <div className="absolute inset-0 animate-[fly_15s_linear_infinite]" />
          </div>
          <div className="absolute top-3/4 -left-5 w-1 h-1 bg-blue-300/80 rounded-full animate-pulse delay-500">
            <div className="absolute inset-0 animate-[fly_20s_linear_infinite_2s]" />
          </div>
          <div className="absolute top-1/2 -left-8 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-1000">
            <div className="absolute inset-0 animate-[fly_18s_linear_infinite_4s]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div
          className={`mb-8 transform transition-all duration-1000 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="relative">
            <div className="flex items-center space-x-2 bg-red-600/90 backdrop-blur-sm px-6 py-3 clip-path-arrow shadow-2xl">
              <a
                href="/"
                className="text-white text-sm font-semibold uppercase tracking-wider hover:text-red-200 transition-colors duration-300"
              >
                HOME
              </a>
              <span className="text-white/80 text-sm">•</span>
              <span className="text-white text-sm font-semibold uppercase tracking-wider">
                ABOUT US
              </span>
            </div>
            {/* Arrow Effect */}
            <div className="absolute -right-3 top-0 w-0 h-0 border-t-[22px] border-b-[22px] border-l-[12px] border-t-transparent border-b-transparent border-l-red-600/90" />
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center">
          <h1
            className={`text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white uppercase tracking-wider transform transition-all duration-1000 delay-500 ${
              isVisible
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-20 opacity-0 scale-95"
            }`}
            style={{
              textShadow:
                "4px 4px 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.5)",
              background:
                "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <span className="inline-block animate-[bounce-in_1s_ease-out_0.8s_both]">
              A
            </span>
            <span className="inline-block animate-[bounce-in_1s_ease-out_0.9s_both]">
              B
            </span>
            <span className="inline-block animate-[bounce-in_1s_ease-out_1s_both]">
              O
            </span>
            <span className="inline-block animate-[bounce-in_1s_ease-out_1.1s_both]">
              U
            </span>
            <span className="inline-block animate-[bounce-in_1s_ease-out_1.2s_both]">
              T
            </span>
            <span className="inline-block mx-4 animate-[bounce-in_1s_ease-out_1.3s_both]">
              {" "}
            </span>
            <span className="inline-block animate-[bounce-in_1s_ease-out_1.4s_both]">
              U
            </span>
            <span className="inline-block animate-[bounce-in_1s_ease-out_1.5s_both]">
              S
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`mt-6 text-xl md:text-2xl text-slate-200 font-light tracking-wide max-w-2xl mx-auto transform transition-all duration-1000 delay-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            Soaring to new heights with excellence and innovation
          </p>

          {/* Decorative Line */}
          <div
            className={`mt-8 w-32 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto transform transition-all duration-1000 delay-900 ${
              isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            }`}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-2 h-2 bg-white/30 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-20 w-1 h-1 bg-blue-300/50 rounded-full animate-ping delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-red-300/40 rounded-full animate-ping delay-2000" />
        </div>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1100 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex flex-col items-center text-white/60">
            <span className="text-sm uppercase tracking-widest mb-2">
              Scroll Down
            </span>
            <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .clip-path-arrow {
          clip-path: polygon(
            0 0,
            calc(100% - 12px) 0,
            100% 50%,
            calc(100% - 12px) 100%,
            0 100%
          );
        }

        @keyframes fly {
          0% {
            transform: translateX(-100vw) translateY(0px);
          }
          100% {
            transform: translateX(100vw) translateY(-20px);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: translateY(20px) rotateX(-90deg);
            opacity: 0;
          }
          50% {
            transform: translateY(-5px) rotateX(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) rotateX(0deg);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .clip-path-arrow {
            clip-path: polygon(
              0 0,
              calc(100% - 8px) 0,
              100% 50%,
              calc(100% - 8px) 100%,
              0 100%
            );
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUsHero;
